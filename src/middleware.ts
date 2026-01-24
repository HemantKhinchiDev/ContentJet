import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isLoggedIn =
    req.cookies.get("fake-auth")?.value === "true";

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Protect everything inside (dashboard) route group
export const config = {
  matcher: ["/((?!api|_next|favicon.ico|login).*)"],
};
