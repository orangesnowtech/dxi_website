import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "dxi_admin_session";

/**
 * A cheap presence check, not the security boundary. This runs on the edge
 * runtime where firebase-admin cannot verify the cookie, so the real check
 * lives in the admin layout and in every /api/admin route handler. This exists
 * so signed-out visitors land on the login page instead of a dashboard shell
 * that then fails to load anything.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (hasSessionCookie) {
    return NextResponse.next();
  }

  // The session endpoint has to stay reachable — it is how a cookie is
  // obtained in the first place, and how sign-out clears a stale one.
  if (pathname.startsWith("/api/admin/session")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
