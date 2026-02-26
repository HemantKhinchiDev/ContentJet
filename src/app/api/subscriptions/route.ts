// src/app/api/subscriptions/route.ts
//
// Subscriptions API
// ──────────────────
// GET    /api/subscriptions → Fetch user's active subscription (null if none)
// POST   /api/subscriptions → Create or upgrade subscription (atomic upsert)
// PATCH  /api/subscriptions → Update active subscription (plan_type, status, end_date)
// DELETE /api/subscriptions → Soft-cancel (status='cancelled', end_date=NOW())
//
// Schema (subscriptions):
//   id UUID PK, user_id UUID FK, plan_type TEXT, status TEXT,
//   start_date TIMESTAMPTZ, end_date TIMESTAMPTZ, created_at TIMESTAMPTZ (DB default)
//
// ⚠️  COLUMN NAMES — use exactly:
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

// Issue 3: ISO timestamp validator used in PATCH end_date validation
function isValidISODate(value: string): boolean {
    const d = new Date(value)
    return !isNaN(d.getTime())
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/subscriptions
// Returns the active subscription directly, or null if none exists.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(_request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }


        const { data, error } = await supabase
            .from('subscriptions')
            .select(
                // Omit raw Stripe IDs (stripe_customer_id, stripe_subscription_id) to
                // avoid exposing enumerable handles to the client — portal sessions are
                // created server-side via create-portal-session instead.
                'id, user_id, plan_type, status, start_date, end_date, created_at, ' +
                'current_period_end, cancel_at_period_end'
            )
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error) {
            // Issue 6: generic error message — don't leak internal DB details
            console.error('[GET /api/subscriptions]', error)
            return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
        }

        // Return null when no active subscription — not an error state
        if (!data) {
            return NextResponse.json(null)
        }

        return NextResponse.json(data)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        console.error('[GET /api/subscriptions] Unexpected:', err)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/subscriptions
// Truly atomic upsert via Supabase RPC.
// Runs entirely inside a single PostgreSQL transaction — concurrent POSTs
// cannot create duplicate active subscriptions.
//
// ⚠️  PREREQUISITE: Run the SQL in supabase/migrations/upsert_subscription.sql
//     in your Supabase SQL editor before using this endpoint.
//
// Body: { plan_type?: 'free' | 'pro' | 'premium' }  (defaults to 'free')
// ─────────────────────────────────────────────────────────────────────────────
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
            // Body is optional — defaults apply below
        }

        const plan_type: PlanType = (body.plan_type as PlanType) ?? 'free'

        if (!(VALID_PLANS as readonly string[]).includes(plan_type)) {
            return NextResponse.json(
                { error: `Invalid plan_type '${plan_type}'. Valid: ${VALID_PLANS.join(', ')}` },
                { status: 400 },
            )
        }


        // Truly atomic: entire upsert runs as a single PostgreSQL transaction.
        // The RPC function uses pg_advisory_xact_lock(user_id) so concurrent
        // calls for the same user are serialized at the DB level.
        const { data, error } = await supabase.rpc('upsert_subscription', {
            pplan_type: plan_type,
        })

        if (error) {
            console.error('[POST /api/subscriptions] RPC error:', error)
            return NextResponse.json({ error: 'Failed to upsert subscription' }, { status: 500 })
        }

        if (!data) {
            console.error('[POST /api/subscriptions] RPC returned no data')
            return NextResponse.json({ error: 'Failed to upsert subscription' }, { status: 500 })
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
// Updates active subscription in a single query (no TOCTOU race).
// Body: { plan_type?: string, status?: string, end_date?: string | null }
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

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
            if (ed === null) {
                updates.end_date = null
            } else if (typeof ed !== 'string') {
                return NextResponse.json(
                    { error: "'end_date' must be an ISO 8601 timestamp string or null" },
                    { status: 400 },
                )
            } else {
                // Issue 3: validate ISO format before storing
                if (!isValidISODate(ed)) {
                    return NextResponse.json(
                        { error: "'end_date' must be a valid ISO 8601 timestamp" },
                        { status: 400 },
                    )
                }
                updates.end_date = ed
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No valid fields provided. Allowed: 'plan_type', 'status', 'end_date'" },
                { status: 400 },
            )
        }

        // Issues 4 & 5: Single UPDATE query — no separate fetch, no TOCTOU.
        // .single() will produce PGRST116 if no active subscription matches.
        const { data, error } = await supabase
            .from('subscriptions')
            .update(updates)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .select('id, user_id, plan_type, status, start_date, end_date, created_at')
            .single()

        // Issue 5: explicit PGRST116 → 404 (no active subscription found)
        if (error?.code === 'PGRST116') {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
        }

        if (error) {
            // Issue 6: generic message — full error logged server-side only
            console.error('[PATCH /api/subscriptions]', error)
            return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
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
// Row is preserved for billing history — no hard deletes.
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(_request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }


        const now = new Date().toISOString()

        // .single() ensures we target exactly one row.
        // If the unique index (idx_unique_active_subscription) is in place,
        // there can only ever be one active subscription per user anyway.
        const { data, error } = await supabase
            .from('subscriptions')
            .update({ status: 'cancelled', end_date: now })
            .eq('user_id', user.id)
            .eq('status', 'active')
            .select('id, plan_type, status, end_date')
            .single()

        if (error?.code === 'PGRST116') {
            return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 404 })
        }

        if (error) {
            console.error('[DELETE /api/subscriptions]', error)
            return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
        }

        return NextResponse.json({ message: 'Subscription cancelled successfully', cancelled: data })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        console.error('[DELETE /api/subscriptions] Unexpected:', err)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
