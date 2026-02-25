// src/app/api/users/route.ts
//
// User Profile API
// ─────────────────
// GET   /api/users → Fetch authenticated user profile
// PATCH /api/users → Update user profile (full_name, avatar_url only)
//
// Schema (users):
//   id UUID PK, email TEXT, full_name TEXT, avatar_url TEXT,
//   created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users
// Returns the authenticated user's profile row.
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
            .from('users')
            .select('id, email, full_name, avatar_url, created_at, updated_at')
            .eq('id', user.id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
            }
            console.error('[GET /api/users]', error)
            return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        console.error('[GET /api/users] Unexpected:', err)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/users
// Updates full_name and/or avatar_url for the authenticated user.
// Body: { full_name?: string, avatar_url?: string }
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

        // Allowlist — only these two fields can be updated
        const ALLOWED = ['full_name', 'avatar_url'] as const
        type AllowedField = (typeof ALLOWED)[number]

        const updates: Partial<Record<AllowedField, string>> = {}

        for (const field of ALLOWED) {
            if (!(field in body)) continue
            const value = body[field]
            if (typeof value !== 'string') {
                return NextResponse.json({ error: `'${field}' must be a string` }, { status: 400 })
            }
            const trimmed = value.trim()
            // Issue 7: reject whitespace-only strings
            if (trimmed.length === 0) {
                return NextResponse.json({ error: `'${field}' cannot be empty` }, { status: 400 })
            }
            if (field === 'full_name' && trimmed.length > 100) {
                return NextResponse.json({ error: "'full_name' must be 100 characters or fewer" }, { status: 400 })
            }
            if (field === 'avatar_url' && trimmed.length > 2048) {
                return NextResponse.json({ error: "'avatar_url' must be 2048 characters or fewer" }, { status: 400 })
            }
            updates[field] = trimmed
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No valid fields provided. Allowed: 'full_name', 'avatar_url'" },
                { status: 400 },
            )
        }

        const { data, error } = await supabase
            .from('users')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', user.id)
            .select('id, email, full_name, avatar_url, created_at, updated_at')
            .single()

        if (error) {
            console.error('[PATCH /api/users]', error)
            return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        console.error('[PATCH /api/users] Unexpected:', err)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
