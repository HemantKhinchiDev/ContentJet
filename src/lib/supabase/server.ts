// src/lib/supabase/server.ts

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for server-side operations.
 * 
 * Use this in:
 * - Server Components (read-only operations)
 * - Route Handlers (full read/write)
 * - Server Actions (full read/write)
 * 
 * Cookie writes only work in Route Handlers and Server Actions.
 * In Server Components, cookie writes are silently ignored
 * (middleware handles session refresh instead).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from Server Components where
            // cookies cannot be modified. This is expected behavior.
            // Session refresh is handled by middleware instead.
          }
        },
      },
    }
  );
}

/**
 * @deprecated Use createSupabaseServerClient() instead
 * Kept for backward compatibility with existing code
 */
export const supabaseServer = createSupabaseServerClient;