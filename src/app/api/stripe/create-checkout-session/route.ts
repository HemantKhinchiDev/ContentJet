// src/app/api/stripe/create-checkout-session/route.ts
//
// POST /api/stripe/create-checkout-session
// Creates a Stripe Checkout session for a subscription plan.
// Requires authenticated user (Supabase session).
//
// Body: { plan: 'monthly' | 'yearly' }
// Returns: { url: string }

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { stripe, STRIPE_MONTHLY_PRICE_ID, STRIPE_YEARLY_PRICE_ID } from '@/lib/stripe'

// Startup guard — fail immediately if price IDs are missing rather than giving
// a misleading "Invalid plan" error to the user at request time.
if (!STRIPE_MONTHLY_PRICE_ID || !STRIPE_YEARLY_PRICE_ID) {
    throw new Error(
        'Missing required Stripe price ID environment variables: ' +
        'STRIPE_MONTHLY_PRICE_ID and STRIPE_YEARLY_PRICE_ID must both be set.'
    )
}

const PLAN_TO_PRICE: Record<string, string> = {
    monthly: STRIPE_MONTHLY_PRICE_ID,
    yearly: STRIPE_YEARLY_PRICE_ID,
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let body: Record<string, unknown> = {}
        try {
            body = await request.json()
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
        }

        const plan = body.plan as string
        if (!plan || !PLAN_TO_PRICE[plan]) {
            return NextResponse.json(
                { error: "Invalid plan. Must be 'monthly' or 'yearly'" },
                { status: 400 },
            )
        }

        const priceId = PLAN_TO_PRICE[plan]

        // Use only server-side config — the client-supplied Origin header can be
        // spoofed, which would turn success_url / cancel_url into an open redirect.
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        if (!siteUrl) {
            console.warn(
                '[POST /api/stripe/create-checkout-session] NEXT_PUBLIC_SITE_URL is not set; ' +
                'falling back to http://localhost:3000. Redirect URLs will be broken in production.'
            )
        }
        // Strip trailing slash to prevent double-slash URLs (e.g. https://example.com//success)
        const origin = (siteUrl ?? 'http://localhost:3000').replace(/\/$/, '')

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/pricing`,
            customer_email: user.email,
            metadata: {
                userId: user.id,
                plan,
            },
        })

        // session.url is string | null — guard before returning
        if (!session.url) {
            console.error('[POST /api/stripe/create-checkout-session] session.url is null')
            return NextResponse.json(
                { error: 'Failed to create checkout session URL' },
                { status: 500 }
            )
        }

        return NextResponse.json({ url: session.url })
    } catch (err: unknown) {
        // Log full error server-side; never forward raw Stripe SDK messages to the
        // client (they can expose price IDs, account config, internal identifiers).
        console.error('[POST /api/stripe/create-checkout-session]', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
