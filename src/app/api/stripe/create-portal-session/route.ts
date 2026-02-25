// src/app/api/stripe/create-portal-session/route.ts
//
// POST /api/stripe/create-portal-session
// Creates a Stripe Billing Portal session so users can manage their subscription.
// Requires authenticated user.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Look up stripe_customer_id from the subscriptions table
        const { data: sub, error: subError } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle()

        if (subError) {
            console.error('[POST /api/stripe/create-portal-session] DB error:', subError?.message)
            return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
        }

        if (!sub?.stripe_customer_id) {
            return NextResponse.json(
                { error: 'No active paid subscription found. Please subscribe first.' },
                { status: 404 },
            )
        }

        // Prefer private SITE_URL (server-only); NEXT_PUBLIC_SITE_URL is inlined into the
        // browser bundle and shouldn't be relied on in server routes unnecessarily.
        // Origin header is intentionally excluded — it's client-supplied (open redirect risk).
        const rawOrigin = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL
        if (!rawOrigin) {
            console.error('[POST /api/stripe/create-portal-session] SITE_URL env var is not set')
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
        }
        // Strip trailing slash to prevent double-slash URLs (e.g. https://example.com//dashboard)
        const origin = rawOrigin.replace(/\/$/, '')

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: sub.stripe_customer_id,
            return_url: `${origin}/dashboard`,
        })

        return NextResponse.json({ url: portalSession.url })
    } catch (err: unknown) {
        console.error('[POST /api/stripe/create-portal-session]', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
