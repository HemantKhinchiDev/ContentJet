// src/app/api/content-history/route.ts
//
// Content History API
// ────────────────────
// GET    /api/content-history            → List content (paginated, optional filter)
// POST   /api/content-history            → Save a new content generation record
// DELETE /api/content-history?id={uuid}  → Delete a specific record (ownership verified)
//
// Schema (content_history):
//   id UUID PK, user_id UUID FK, content_type TEXT,
//   content_data JSONB, created_at TIMESTAMPTZ
//
// content_type values: 'image' | 'video' | 'text'
// content_data: flexible JSONB — any valid JSON object

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const VALID_CONTENT_TYPES = ['image', 'video', 'text'] as const
type ContentType = (typeof VALID_CONTENT_TYPES)[number]

// Issue 9: validate UUID format before hitting the database
function isValidUUID(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/content-history
// Returns paginated content history for the authenticated user.
//
// Query params:
//   ?page=1          (default: 1)
//   ?limit=10        (default: 10, max: 100)
//   ?content_type=   (optional: 'image' | 'video' | 'text')
//
// Response: { data: [...], pagination: { total, page, limit, totalPages } }
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)

        const page = Math.max(1, parseInt(searchParams.get('page') ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE)
        const rawLimit = parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10)
        const limit = Math.min(Math.max(1, rawLimit || DEFAULT_LIMIT), MAX_LIMIT)
        const contentTypeFilter = searchParams.get('content_type')

        // Validate content_type filter if provided
        if (contentTypeFilter && !(VALID_CONTENT_TYPES as readonly string[]).includes(contentTypeFilter)) {
            return NextResponse.json(
                { error: `Invalid content_type '${contentTypeFilter}'. Valid: ${VALID_CONTENT_TYPES.join(', ')}` },
                { status: 400 },
            )
        }

        const offset = (page - 1) * limit

        let query = supabase
            .from('content_history')
            .select('id, user_id, content_type, content_data, created_at', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (contentTypeFilter) {
            query = query.eq('content_type', contentTypeFilter as ContentType)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('[GET /api/content-history]', error)
            return NextResponse.json({ error: 'Failed to fetch content history' }, { status: 500 })
        }

        const total = count ?? 0
        const totalPages = Math.ceil(total / limit)

        return NextResponse.json({
            data: data ?? [],
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        console.error('[GET /api/content-history] Unexpected:', err)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/content-history
// Saves a new AI-generated content record for the authenticated user.
//
// Body: {
//   content_type: 'image' | 'video' | 'text'   (required)
//   content_data: { ... }                        (required — any JSON object)
// }
//
// content_data examples:
//   { "title": "My Post", "body": "..." }
//   { "url": "https://...", "prompt": "..." }
//   { "key": "any flexible JSONB structure" }
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

        let body: Record<string, unknown>
        try {
            body = await request.json()
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
        }

        const { content_type, content_data } = body

        // Validate content_type
        if (!content_type || typeof content_type !== 'string') {
            return NextResponse.json(
                { error: `'content_type' is required. Valid: ${VALID_CONTENT_TYPES.join(', ')}` },
                { status: 400 },
            )
        }
        if (!(VALID_CONTENT_TYPES as readonly string[]).includes(content_type)) {
            return NextResponse.json(
                { error: `Invalid content_type '${content_type}'. Valid: ${VALID_CONTENT_TYPES.join(', ')}` },
                { status: 400 },
            )
        }

        // Validate content_data — must be a non-null plain object (JSONB)
        if (
            content_data === null ||
            content_data === undefined ||
            typeof content_data !== 'object' ||
            Array.isArray(content_data)
        ) {
            return NextResponse.json(
                { error: "'content_data' is required and must be a JSON object (not an array or primitive)" },
                { status: 400 },
            )
        }

        const now = new Date().toISOString()

        const { data, error } = await supabase
            .from('content_history')
            .insert({
                user_id: user.id,
                content_type: content_type as ContentType,
                content_data,          // JSONB — Supabase accepts plain JS objects directly
                created_at: now,
            })
            .select('id, user_id, content_type, content_data, created_at')
            .single()

        if (error) {
            console.error('[POST /api/content-history]', error)
            return NextResponse.json({ error: 'Failed to save content history' }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        console.error('[POST /api/content-history] Unexpected:', err)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/content-history?id={uuid}
// Permanently deletes a specific content record.
// Ownership guard: filters on both id AND user_id — cannot delete other users' data.
//
// Query param:
//   ?id=  (required — UUID of the content_history row)
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')?.trim()

        if (!id) {
            return NextResponse.json(
                { error: "Query param 'id' is required. Usage: DELETE /api/content-history?id={uuid}" },
                { status: 400 },
            )
        }

        // Issue 9: validate UUID format — prevents DB 500 on malformed input
        if (!isValidUUID(id)) {
            return NextResponse.json(
                { error: "'id' must be a valid UUID (e.g. 3fdb1efb-6867-4b09-b9a5-c3a83e4dbde2)" },
                { status: 400 },
            )
        }

        // Both conditions must match — prevents deleting another user's record
        const { data, error } = await supabase
            .from('content_history')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
            .select('id')

        if (error) {
            console.error('[DELETE /api/content-history]', error)
            return NextResponse.json({ error: 'Failed to delete content history entry' }, { status: 500 })
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                { error: 'Record not found or you do not have permission to delete it' },
                { status: 404 },
            )
        }

        return NextResponse.json({ message: 'Content history entry deleted successfully', id })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        console.error('[DELETE /api/content-history] Unexpected:', err)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
