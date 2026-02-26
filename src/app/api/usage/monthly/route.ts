// src/app/api/usage/monthly/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        let userId: string;

        if (process.env.NODE_ENV === 'development') {
            // Use same dev user ID as the generate route
            userId = 'dev-user-00000000-0000-0000-0000-000000000000';
        } else {
            const supabase = await createSupabaseServerClient();

            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            userId = user.id;
        }

        // Query usage for this month
        const supabase = await createSupabaseServerClient();
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const { data, error } = await supabase
            .from('ai_usage_logs')
            .select('total_tokens')
            .eq('user_id', userId)
            .gte('created_at', monthStart);

        if (error) {
            console.error('[GET /api/usage/monthly]', error);
            return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 });
        }

        const totalTokens = data?.reduce((sum: number, log: { total_tokens: number }) => sum + log.total_tokens, 0) ?? 0;
        const count = data?.length ?? 0;

        return NextResponse.json({ tokens: totalTokens, count });
    } catch (err) {
        console.error('[GET /api/usage/monthly] Unexpected:', err);
        return NextResponse.json({ tokens: 0, count: 0 });
    }
}
