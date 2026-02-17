import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // 🔍 DEBUG: Log full incoming URL
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[Auth Callback] 🔵 INCOMING REQUEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Full URL:', request.url);
  console.log('Origin:', origin);
  console.log('All Query Params:', Object.fromEntries(searchParams.entries()));

  // Magic Link / Email Verification logic
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  // OAuth logic
  const code = searchParams.get('code');

  const next = searchParams.get('next') ?? '/dashboard';

  console.log('[Auth Callback] Parsed parameters:', {
    token_hash: token_hash ? `${token_hash.substring(0, 10)}...` : 'null',
    type,
    code: code ? `${code.substring(0, 10)}...` : 'null',
    next,
  });

  // Create a response object that we'll return
  // This allows Supabase to set cookies on this same response
  let response = NextResponse.next({
    request,
  });

  const cookieStore = await cookies();

  // 🔍 DEBUG: Log existing cookies
  const existingCookies = cookieStore.getAll();
  console.log('[Auth Callback] Existing cookies:', existingCookies.map(c => c.name));

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
            console.log('[Auth Callback] 🍪 Setting cookies:', cookiesToSet.map(c => c.name));
            // Set cookies on the response object
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
              response.cookies.set(name, value, options);
            });
          } catch (error) {
            console.error('[Auth Callback] ❌ Cookie setting error:', error);
          }
        },
      },
    }
  );

  // 1. Handle Email Verification (Token Hash)
  if (token_hash && type) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Auth Callback] 📧 EMAIL VERIFICATION FLOW');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Auth Callback] Type:', type);
    console.log('[Auth Callback] Token Hash:', token_hash.substring(0, 20) + '...');

    console.log('[Auth Callback] 🔄 Calling supabase.auth.verifyOtp()...');
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email',
      token_hash,
    });

    console.log('[Auth Callback] 📊 verifyOtp() RESPONSE:');
    console.log('  - Error:', error ? JSON.stringify(error, null, 2) : 'null');
    console.log('  - User:', data?.user ? {
      id: data.user.id,
      email: data.user.email,
      email_confirmed_at: data.user.email_confirmed_at,
      confirmed_at: data.user.confirmed_at,
      user_metadata: data.user.user_metadata,
    } : 'null');
    console.log('  - Session exists:', !!data?.session);
    if (data?.session) {
      console.log('  - Session access_token:', data.session.access_token.substring(0, 20) + '...');
      console.log('  - Session refresh_token:', data.session.refresh_token ? data.session.refresh_token.substring(0, 20) + '...' : 'null');
    }

    if (!error) {
      console.log('[Auth Callback] ✅ Email verified successfully in Supabase:', data.user?.email);

      // CRITICAL: Only update Prisma for email verification types
      // This ensures we don't accidentally mess up OAuth flows or other types
      if (type === 'signup' || type === 'email') {
        if (data.user?.email) {
          try {
            console.log('[Auth Callback] 🔄 Attempting to update Prisma user...');
            const { prisma } = await import('@/lib/prisma');

            // We use upsert to ensure the user exists in Prisma
            // matching by email which is unique
            const result = await prisma.user.upsert({
              where: {
                email: data.user.email
              },
              update: {
                emailVerified: new Date(),
                email_confirmed_at: new Date(),
                updatedAt: new Date()
              },
              create: {
                id: data.user.id,
                email: data.user.email,
                emailVerified: new Date(),
                email_confirmed_at: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });

            console.log('[Auth Callback] ✅ Prisma upsert result:', result);
          } catch (prismaError) {
            console.error('[Auth Callback] ❌ Prisma update failed:', prismaError);
            // We consciously do NOT block the redirect. 
            // The user is authenticated in Supabase, which is the primary source of truth.
            // A background job or checking Supabase session claims can reconcile this later if needed.
          }
        } else {
          console.warn('[Auth Callback] ⚠️ No email found in verified session data');
        }
      } else {
        console.log('[Auth Callback] ℹ️ Skipping Prisma update for non-verification type:', type);
      }

      // Return the response with cookies attached
      return NextResponse.redirect(`${origin}${next}`, response);
    }

    console.error('[Auth Callback] ❌ Verify OTP Error:', {
      message: error.message,
      status: error.status,
      name: error.name,
    });

    // Redirect with error details
    return NextResponse.redirect(`${origin}/login?reason=verification-failed&error=${encodeURIComponent(error.message)}`, response);
  }

  // 2. Handle OAuth (Code Exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`, response);
    }

    console.error('[Auth] Code Exchange Error:', error);
    return NextResponse.redirect(`${origin}/auth/error?error=exchange_failed`, response);
  }

  // 3. Fallback for no auth data
  return NextResponse.redirect(`${origin}/auth/error?error=invalid_request`, response);
}