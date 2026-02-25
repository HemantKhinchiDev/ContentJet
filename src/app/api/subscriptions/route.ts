// src/app/api/subscriptions/route.ts
//
// Subscriptions API
// ──────────────────
// GET    /api/subscriptions → Fetch user's active subscription (null if none)
// POST   /api/subscriptions → Create subscription (default: free, active)
// PATCH  /api/subscriptions → Update active subscription (plan_type, status, end_date)
// DELETE /api/subscriptions → Soft-cancel (status='cancelled', end_date=NOW())
//
// Schema (subscriptions):
//   id UUID PK, user_id UUID FK, plan_type TEXT, status TEXT,
//   start_date TIMESTAMPTZ, end_date TIMESTAMPTZ, created_at TIMESTAMPTZ
//
// ⚠️  COLUMN NAMES — use exactly as below:
//   plan_type  (NOT "plan")
//   start_date (NOT "started_at")
//   end_date   (NOT "ends_at")

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const VALID_PLANS = ['free', 'pro', 'premium'] as const
const VALID_STATUSES = ['active', 'cancelled', 'expired'] as const

type PlanType = (typeof VALID_PLANS)[number]
type Status = (typeof VALID_STATUSES)[number]

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/subscriptions
// Returns the active subscription, or { data: null } if none exists.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(_request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('subscriptions')
            .select('id, user_id, plan_type, status, start_date, end_date, created_at')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle() // returns null (not error) when no row found

        if (error) {
            console.error('[GET /api/subscriptions]', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // ✅ Return null when no active subscription (not an error)
        if (!data) {
            return NextResponse.json(null)
        }

        // ✅ Return flat object — NOT wrapped in { data }
        return NextResponse.json(data)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        console.error('[GET /api/subscriptions] Unexpected:', err)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/subscriptions
// Creates a new subscription. Cancels any existing active one first.
// Body: { plan_type?: 'free' | 'pro' | 'premium' }  (defaults to 'free')
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let body: Record<string, unknown> = {}
        try {
            body = await request.json()
        } catch {
            // Body is optional for POST — defaults apply below
        }

        const plan_type: PlanType = (body.plan_type as PlanType) ?? 'free'

        if (!(VALID_PLANS as readonly string[]).includes(plan_type)) {
            return NextResponse.json(
                { error: `Invalid plan_type '${plan_type}'. Valid: ${VALID_PLANS.join(', ')}` },
                { status: 400 },
            )
        }

        const now = new Date().toISOString()

        // Cancel any existing active subscription before creating a new one
        const { error: cancelError } = await supabase
            .from('subscriptions')
            .update({ status: 'cancelled', end_date: now })
            .eq('user_id', user.id)
            .eq('status', 'active')

        if (cancelError) {
            console.error('[POST /api/subscriptions] Cancel existing:', cancelError)
            return NextResponse.json({ error: cancelError.message }, { status: 500 })
        }

        const { data, error } = await supabase
            .from('subscriptions')
            .insert({
                user_id: user.id,
                plan_type,
                status: 'active' as Status,
                start_date: now,
                end_date: null,
                created_at: now,
            })
            .select('id, user_id, plan_type, status, start_date, end_date, created_at')
            .single()

        if (error) {
            console.error('[POST /api/subscriptions] Insert:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        console.error('[POST /api/subscriptions] Unexpected:', err)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/subscriptions
// Updates the active subscription's plan_type, status, and/or end_date.
// Body: { plan_type?: string, status?: string, end_date?: string | null }
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let body: Record<string, unknown>
        try {
            body = await request.json()
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
        }

        const updates: Partial<{ plan_type: PlanType; status: Status; end_date: string | null }> = {}

        if ('plan_type' in body) {
            const pt = body.plan_type
            if (typeof pt !== 'string' || !(VALID_PLANS as readonly string[]).includes(pt)) {
                return NextResponse.json(
                    { error: `Invalid plan_type. Valid: ${VALID_PLANS.join(', ')}` },
                    { status: 400 },
                )
            }
            updates.plan_type = pt as PlanType
        }

        if ('status' in body) {
            const st = body.status
            if (typeof st !== 'string' || !(VALID_STATUSES as readonly string[]).includes(st)) {
                return NextResponse.json(
                    { error: `Invalid status. Valid: ${VALID_STATUSES.join(', ')}` },
                    { status: 400 },
                )
            }
            updates.status = st as Status
        }

        if ('end_date' in body) {
            const ed = body.end_date
            if (ed !== null && typeof ed !== 'string') {
                return NextResponse.json({ error: "'end_date' must be an ISO timestamp string or null" }, { status: 400 })
            }
            updates.end_date = ed as string | null
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No valid fields provided. Allowed: 'plan_type', 'status', 'end_date'" },
                { status: 400 },
            )
        }

        // Find the current active subscription first
        const { data: existing, error: fetchError } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 })
        }
        if (!existing) {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
        }

        const { data, error } = await supabase
            .from('subscriptions')
            .update(updates)
            .eq('id', existing.id)
            .eq('user_id', user.id)
            .select('id, user_id, plan_type, status, start_date, end_date, created_at')
            .single()

        if (error) {
            console.error('[PATCH /api/subscriptions]', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        console.error('[PATCH /api/subscriptions] Unexpected:', err)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/subscriptions
// Soft-cancels the active subscription (status='cancelled', end_date=NOW()).
// The row is retained for billing history — no hard deletes.
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(_request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date().toISOString()

        const { data, error } = await supabase
            .from('subscriptions')
            .update({ status: 'cancelled', end_date: now })
            .eq('user_id', user.id)
            .eq('status', 'active')
            .select('id, plan_type, status, end_date')

        if (error) {
            console.error('[DELETE /api/subscriptions]', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Subscription cancelled successfully', cancelled: data })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        console.error('[DELETE /api/subscriptions] Unexpected:', err)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
