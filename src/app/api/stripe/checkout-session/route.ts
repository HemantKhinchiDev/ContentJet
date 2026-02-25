// src/app/api/stripe/checkout-session/route.ts
//
// GET /api/stripe/checkout-session?session_id=cs_xxx
// Returns plan details for the /success page after checkout completes.
// Requires auth so only the paying user can read their session.
//
// NOTE: Stripe acacia API — Subscription no longer has current_period_end.
// We use billing_cycle_anchor + plan interval to compute next billing date.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

function computeNextBillingDate(sub: Stripe.Subscription): string | null {
    if (!sub.billing_cycle_anchor) return null
    const anchor = new Date(sub.billing_cycle_anchor * 1000)
    const interval = sub.items.data[0]?.price?.recurring?.interval ?? 'month'
    const now = new Date()

    // Advance anchor until it's in the future
    while (anchor <= now) {
        if (interval === 'year') {
            anchor.setFullYear(anchor.getFullYear() + 1)
        } else {
            anchor.setMonth(anchor.getMonth() + 1)
        }
    }

    return anchor.toLocaleDateString('en-SG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const sessionId = request.nextUrl.searchParams.get('session_id')
        if (!sessionId) {
            return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription'],
        })

        // Ensure this session belongs to the authenticated user
        if (session.metadata?.userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const subscription = session.subscription as Stripe.Subscription | null
        const nextBillingDate = subscription ? computeNextBillingDate(subscription) : null

        return NextResponse.json({
            plan: session.metadata?.plan ?? 'subscription',
            customerEmail: session.customer_email ?? user.email,
            nextBillingDate,
            status: session.status,
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        console.error('[GET /api/stripe/checkout-session]', err)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
