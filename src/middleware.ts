// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase Auth Middleware
 * 
 * Responsibilities:
 * - Protect /dashboard routes from unauthenticated access
 * - Refresh expired sessions automatically
 * - Write refreshed tokens back to cookies
 * 
 * Uses getAll/setAll cookie API (required for Supabase SSR v0.5+)
 */

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ Only protect dashboard routes - let all other routes pass through
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // ✅ DEV MODE: Allow access if the dev-auth-token cookie is present.
  // DevLoginForm sets this cookie on successful dev sign-in.
  // We check the cookie instead of bypassing all Supabase logic, so that
  // real email verification flows can still be tested in development.
  if (process.env.NODE_ENV === "development") {
    const devToken = req.cookies.get("dev-auth-token");
    if (devToken?.value === "true") {
      console.log(`🛠️  [Middleware] Dev auth token found → allowing ${pathname}`);
      return NextResponse.next();
    }
    // No dev token → fall through to Supabase check (allows email verify testing)
    console.log(`🔍 [Middleware] No dev token, running Supabase check for: ${pathname}`);
  }

  // Create response object (needed for cookie modifications)
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Create Supabase client with getAll/setAll cookie handlers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // First, update the request cookies (for downstream use)
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });

          // Recreate response with updated request
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });

          // Set cookies on the response (for browser)
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // ─────────────────────────────────────────────────────────────────
  // IMPORTANT: Use getUser() instead of getSession()
  // 
  // getSession() only reads from cookies (can be spoofed)
  // getUser() validates the token with Supabase server (secure)
  // ─────────────────────────────────────────────────────────────────
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // 🆕 ADDED: Log auth result so you can see what's happening in the terminal
  if (user) {
    console.log(`✅ [Middleware] Authenticated: ${user.email} → allowing ${pathname}`);
  } else {
    console.log(`❌ [Middleware] Not authenticated → redirecting to /login (from ${pathname})`);
    if (error) {
      console.log(`   Auth error: ${error.message}`);
    }
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";

    // Optionally preserve the intended destination
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated - allow access and return response with any refreshed cookies
  return res;
}

export const config = {
  matcher: [
    /*
     * Match dashboard routes only
     * 
     * Excludes:
     * - api routes (/api/*)
     * - static files (_next/static/*, favicon.ico, etc.)
     * - public routes (/, /login, /signup, etc.)
     */
    "/dashboard/:path*",
  ],
};