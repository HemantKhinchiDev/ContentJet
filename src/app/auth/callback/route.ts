import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  
  // Magic Link / Email Verification logic
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  
  // OAuth logic
  const code = searchParams.get('code');
  
  const next = searchParams.get('next') ?? '/dashboard';

  const cookieStore = await cookies();

  const supabase = createServerClient(
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
          } catch (error) {
            // Server component setting cookies error - safe to ignore
          }
        },
      },
    }
  );

  // 1. Handle Email Verification (Token Hash)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    
    console.error('[Auth] Verify OTP Error:', error);
    return NextResponse.redirect(`${origin}/auth/error?error=verification_failed`);
  }

  // 2. Handle OAuth (Code Exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    
    console.error('[Auth] Code Exchange Error:', error);
    return NextResponse.redirect(`${origin}/auth/error?error=exchange_failed`);
  }

  // 3. Fallback for no auth data
  return NextResponse.redirect(`${origin}/auth/error?error=invalid_request`);
}