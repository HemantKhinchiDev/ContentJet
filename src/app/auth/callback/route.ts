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
    console.log('[Auth Callback] Email verification attempt:', {
      type,
      token_hash: token_hash.substring(0, 10) + '...',
      next,
    });

    const { data, error } = await supabase.auth.verifyOtp({
      type: type as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email',
      token_hash,
    });

    if (!error) {
      console.log('[Auth Callback] ✅ Email verified successfully:', data);
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('[Auth Callback] ❌ Verify OTP Error:', {
      message: error.message,
      status: error.status,
      name: error.name,
    });
    return NextResponse.redirect(`${origin}/login?reason=verification-failed`);
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