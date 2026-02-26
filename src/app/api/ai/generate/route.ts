// src/app/api/ai/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { aiService } from '@/lib/ai/service';
import { buildMessagesFromTemplate, listTemplates, PROMPTS } from '@/lib/ai/prompts';
import { isWithinTokenLimit } from '@/lib/ai/tokens';

const MAX_COMPLETION_TOKENS = 2048;
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

const ALLOWED_MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
    'gemini-pro',
];

// ─── GET /api/ai/generate ──────────────────────────────────────────────────────
// Returns available templates for populating the UI selector
export async function GET() {
    return NextResponse.json({ templates: listTemplates() });
}

// ─── POST /api/ai/generate ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    // 1. Auth check
    // Uses createSupabaseServerClient (getAll cookie adapter) — required for
    // @supabase/ssr to read the full session. Inline get()-only adapters fail.
    let userId: string;
    try {
        // In development, the client uses fake auth (localStorage), not real
        // Supabase cookies. Mirror the middleware bypass — trust the request.
        if (process.env.NODE_ENV === 'development') {
            userId = 'dev-user-00000000-0000-0000-0000-000000000000';
        } else {
            const supabase = await createSupabaseServerClient();

            // getUser — validates JWT with Supabase server (secure)
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (!user) {
                console.error('[AI] Auth failed:', userError?.message ?? 'No session');
                return NextResponse.json(
                    { error: 'Unauthorized — please sign in to use AI generation.' },
                    { status: 401 },
                );
            }

            userId = user.id;
        }
    } catch {
        return NextResponse.json(
            { error: 'Authentication service unavailable.' },
            { status: 503 },
        );
    }

    // 2. Parse body
    let body: { templateName?: string; variables?: Record<string, string>; model?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid request body — expected JSON.' },
            { status: 400 },
        );
    }

    const { templateName, variables = {}, model } = body;

    // 3. Validate template
    if (!templateName || !PROMPTS[templateName]) {
        return NextResponse.json(
            {
                error: `Invalid templateName "${templateName}". Valid templates: ${Object.keys(PROMPTS).join(', ')}`,
            },
            { status: 400 },
        );
    }

    // 4. Build messages
    let messages;
    try {
        messages = buildMessagesFromTemplate(templateName, variables);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to build prompt.';
        return NextResponse.json({ error: message }, { status: 400 });
    }

    // 5. Token limit guard
    const activeModel = model ?? DEFAULT_MODEL;

    if (!ALLOWED_MODELS.includes(activeModel)) {
        return NextResponse.json(
            { error: `Invalid model "${activeModel}". Allowed models: ${ALLOWED_MODELS.join(', ')}` },
            { status: 400 },
        );
    }

    if (!isWithinTokenLimit(messages, activeModel, MAX_COMPLETION_TOKENS)) {
        return NextResponse.json(
            {
                error:
                    'Your input is too long for the selected model. Please shorten your variable inputs and try again.',
            },
            { status: 422 },
        );
    }

    // 6. Generate
    const startTime = Date.now();
    let result;
    try {
        result = await aiService.generateCompletion(messages, {
            model: activeModel,
            maxTokens: MAX_COMPLETION_TOKENS,
        });
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : 'AI generation failed. Please try again.';
        return NextResponse.json({ error: message }, { status: 500 });
    }

    // 7. Log usage to Supabase (best-effort — don't fail the request on log error)
    createSupabaseServerClient().then(supabase => {
        supabase.from('ai_usage_logs').insert({
            user_id: userId,
            template_name: templateName,
            provider: result.provider,
            model: result.model,
            prompt_tokens: result.promptTokens,
            completion_tokens: result.completionTokens,
            total_tokens: result.totalTokens,
            duration_ms: Date.now() - startTime,
        }).then(({ error: insertError }) => {
            if (insertError) console.error('[AI] Failed to write usage log:', insertError);
        });
    }).catch(err => console.error('[AI] Failed to write usage log:', err));

    // 8. Respond
    return NextResponse.json({
        content: result.content,
        metadata: {
            provider: result.provider,
            model: result.model,
            tokens: {
                prompt: result.promptTokens,
                completion: result.completionTokens,
                total: result.totalTokens,
            },
            durationMs: result.durationMs,
        },
    });
}
