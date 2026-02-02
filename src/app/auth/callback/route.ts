// src/app/auth/callback/route.ts

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Auth Callback Route Handler
 * 
 * Handles both:
 * - Email verification (magic link / confirm signup)
 * - OAuth callbacks (Google, GitHub, etc.)
 * 
 * This MUST be a Route Handler (not a page) because:
 * - exchangeCodeForSession() needs to set HTTP-only cookies
 * - Cookies can only be set in Route Handlers or Server Actions
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  
  // Extract query parameters
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  
  // Handle OAuth provider errors (e.g., user denied access)
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    console.error('[Auth Callback] Provider error:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(
        errorDescription || 'Authentication was denied or failed.'
      )}`
    );
  }

  // Handle missing authorization code
  if (!code) {
    console.error('[Auth Callback] No authorization code provided');
    return NextResponse.redirect(
      `${origin}/auth/error?error=missing_code&error_description=${encodeURIComponent(
        'No authorization code was provided. Please try signing in again.'
      )}`
    );
  }

  // Get cookie store for session management
  const cookieStore = await cookies();

  // Create Supabase client with cookie handlers
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
            // This can happen when called from Server Components
            // Safe to ignore if middleware handles session refresh
            console.error('[Auth Callback] Cookie set error:', error);
          }
        },
      },
    }
  );

  try {
    // Exchange the code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[Auth Callback] Code exchange failed:', exchangeError.message);
      return NextResponse.redirect(
        `${origin}/auth/error?error=exchange_failed&error_description=${encodeURIComponent(
          exchangeError.message
        )}`
      );
    }

    // Verify session was created
    if (!data.session) {
      console.error('[Auth Callback] No session returned after exchange');
      return NextResponse.redirect(
        `${origin}/auth/error?error=no_session&error_description=${encodeURIComponent(
          'Failed to create session. Please try signing in again.'
        )}`
      );
    }

    console.log('[Auth Callback] Success - User:', data.session.user.email);

    // Successful authentication - redirect to intended destination
    return NextResponse.redirect(`${origin}${next}`);

  } catch (err) {
    console.error('[Auth Callback] Unexpected error:', err);
    return NextResponse.redirect(
      `${origin}/auth/error?error=unexpected_error&error_description=${encodeURIComponent(
        'An unexpected error occurred during sign in. Please try again.'
      )}`
    );
  }
}