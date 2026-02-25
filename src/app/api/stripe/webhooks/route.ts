// src/app/api/stripe/webhooks/route.ts
//
// POST /api/stripe/webhooks
// Receives and processes Stripe webhook events.
//
// ⚠️  NO AUTH — Stripe signs every request; we verify the signature.
//     Next.js App Router provides raw body via req.text() — no bodyParser needed.
//
// NOTE: Stripe acacia API changes:
//   - Subscription no longer has current_period_start/end (use billing_cycle_anchor)
//   - Invoice.subscription is gone — access via invoice.parent?.subscription_details?.subscription

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Supabase service-role client
// Fails loudly when service key is missing — silent fallback to anon key would
// cause all webhook writes to be silently blocked by RLS.
// ---------------------------------------------------------------------------
function getServiceSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!svcKey) {
        const msg = '[webhook] SUPABASE_SERVICE_ROLE_KEY is not set — cannot bypass RLS. Webhook writes will fail.'
        console.error(msg)
        throw new Error(msg)
    }

    return createClient(url, svcKey)
}

// ---------------------------------------------------------------------------
// Stripe status → internal DB status mapping
// Every non-active status must be mapped explicitly — defaulting unknown
// values to 'active' would grant continued access to users with failed payments.
// ---------------------------------------------------------------------------
const STRIPE_STATUS_MAP: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'cancelled',
    unpaid: 'unpaid',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    paused: 'paused',
}

// ---------------------------------------------------------------------------
// getPeriodEnd — compute the true NEXT billing date from billing_cycle_anchor
//
// billing_cycle_anchor is a FIXED timestamp (set at subscription creation).
// Adding one interval to it only gives the second billing date, not the next
// one. We advance the anchor forward in intervals until it's in the future.
// ---------------------------------------------------------------------------
function getPeriodEnd(sub: Stripe.Subscription): string | null {
    if (!sub.billing_cycle_anchor) return null

    const price = sub.items.data[0]?.price
    const interval = price?.recurring?.interval ?? 'month'
    const intervalCount = price?.recurring?.interval_count ?? 1

    // Malformed data guard — interval_count < 1 would cause an infinite loop
    if (intervalCount < 1) {
        console.error('[webhook] getPeriodEnd: interval_count < 1, cannot compute period end')
        return null
    }

    const anchor = new Date(sub.billing_cycle_anchor * 1000)
    const anchorDay = anchor.getDate() // preserve original day for month-end clamping
    const now = new Date()

    while (anchor <= now) {
        switch (interval) {
            case 'year': {
                anchor.setFullYear(anchor.getFullYear() + intervalCount)
                // Clamp day after year advance (Feb 29 leap-year edge case)
                const maxDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()
                anchor.setDate(Math.min(anchorDay, maxDay))
                break
            }
            case 'month': {
                anchor.setMonth(anchor.getMonth() + intervalCount)
                // Clamp day to last day of resulting month (e.g. Jan 31 + 1 month → Feb 28)
                const maxDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()
                anchor.setDate(Math.min(anchorDay, maxDay))
                break
            }
            case 'week': anchor.setDate(anchor.getDate() + 7 * intervalCount); break
            case 'day': anchor.setDate(anchor.getDate() + intervalCount); break
            default: {
                anchor.setMonth(anchor.getMonth() + intervalCount)
                // Clamp day to last day of resulting month (e.g. Jan 31 + 1 month → Feb 28)
                const maxDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()
                anchor.setDate(Math.min(anchorDay, maxDay))
                break
            }
        }
    }

    return anchor.toISOString()
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId
    if (!userId) {
        console.warn('[webhook] checkout.session.completed: no userId in metadata — skipping')
        return
    }

    const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription as Stripe.Subscription | null)?.id

    const customerId = typeof session.customer === 'string'
        ? session.customer
        : (session.customer as Stripe.Customer | null)?.id

    if (!subscriptionId || !customerId) {
        console.warn('[webhook] checkout.session.completed: missing subscriptionId or customerId')
        return
    }

    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    const plan = session.metadata?.plan ?? 'monthly'
    const periodEnd = getPeriodEnd(sub)
    const supabase = getServiceSupabase()

    const updateData: Record<string, unknown> = {
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan_type: plan,
        status: 'active',
        cancel_at_period_end: sub.cancel_at_period_end,
    }
    if (periodEnd) updateData.current_period_end = periodEnd

    // Use upsert so the row is created if it doesn't exist yet.
    // (The checkout flow may fire before the subscription row is pre-created.)
    const { error } = await supabase
        .from('subscriptions')
        .upsert(
            { user_id: userId, ...updateData },
            { onConflict: 'user_id' }
        )

    if (error) {
        console.error('[webhook] checkout.session.completed: Supabase upsert failed', error)
        throw new Error(`Supabase upsert failed: ${error.message}`)
    }
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
    const supabase = getServiceSupabase()
    const customerId = typeof sub.customer === 'string'
        ? sub.customer
        : (sub.customer as Stripe.Customer).id

    // Determine plan from price ID
    const priceId = sub.items.data[0]?.price?.id
    const plan = priceId === process.env.STRIPE_YEARLY_PRICE_ID ? 'yearly' : 'monthly'
    const status = STRIPE_STATUS_MAP[sub.status] ?? sub.status
    const periodEnd = getPeriodEnd(sub)

    const updateData: Record<string, unknown> = {
        plan_type: plan,
        status,
        cancel_at_period_end: sub.cancel_at_period_end,
    }
    if (periodEnd) updateData.current_period_end = periodEnd

    const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('stripe_customer_id', customerId)

    if (error) {
        console.error('[webhook] customer.subscription.updated: Supabase update failed', error)
        throw new Error(`Supabase update failed: ${error.message}`)
    }
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
    const supabase = getServiceSupabase()
    const customerId = typeof sub.customer === 'string'
        ? sub.customer
        : (sub.customer as Stripe.Customer).id

    const { error } = await supabase
        .from('subscriptions')
        .update({
            status: 'cancelled',
            end_date: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId)

    if (error) {
        console.error('[webhook] customer.subscription.deleted: Supabase update failed', error)
        throw new Error(`Supabase update failed: ${error.message}`)
    }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    // In acacia API, access subscription via invoice.parent.subscription_details.subscription
    const parent = invoice.parent as (Stripe.Invoice['parent'] & {
        subscription_details?: { subscription?: string | Stripe.Subscription }
    }) | null

    const subRef = parent?.subscription_details?.subscription
    if (!subRef) return

    const subId = typeof subRef === 'string' ? subRef : subRef.id
    const sub = await stripe.subscriptions.retrieve(subId)
    const periodEnd = getPeriodEnd(sub)
    const supabase = getServiceSupabase()

    const updateData: Record<string, unknown> = { status: 'active' }
    if (periodEnd) updateData.current_period_end = periodEnd

    const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('stripe_subscription_id', subId)

    if (error) {
        console.error('[webhook] invoice.payment_succeeded: Supabase update failed', error)
        throw new Error(`Supabase update failed: ${error.message}`)
    }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret || webhookSecret === 'whsec_placeholder') {
        console.error('[webhook] STRIPE_WEBHOOK_SECRET not configured')
        return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    const sig = request.headers.get('stripe-signature')
    const body = await request.text()

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, sig!, webhookSecret)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Webhook verification failed'
        console.error('[webhook] Signature verification failed:', message)
        return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
                break

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
                break

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
                break

            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
                break

            case 'invoice.payment_failed':
                console.warn('[webhook] invoice.payment_failed for customer:',
                    (event.data.object as Stripe.Invoice).customer)
                break

            default:
                // Return 200 for unhandled events so Stripe doesn't retry them
                break
        }
    } catch (err) {
        console.error(`[webhook] Error handling ${event.type}:`, err)
        // Return 500 so Stripe will retry the event
        return NextResponse.json({ error: 'Handler error' }, { status: 500 })
    }

    return NextResponse.json({ received: true })
}
