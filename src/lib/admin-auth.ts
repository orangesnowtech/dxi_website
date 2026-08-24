import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export const ADMIN_SESSION_COOKIE = "dxi_admin_session";

// Five days. Firebase allows up to fourteen; a shorter window keeps a
// forgotten laptop from staying signed in for a fortnight.
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;

/**
 * The one account that cannot be locked out and is the only one allowed to
 * grant or revoke admin access. Hardcoded on purpose: it is the bootstrap, so
 * it must work with no environment configuration at all. Overridable for
 * staging, but the default is what production runs on.
 */
export const SUPER_ADMIN_EMAIL = (
  process.env.SUPER_ADMIN_EMAIL || "chris@dximarketing.com"
)
  .trim()
  .toLowerCase();

export type AdminSession = {
  uid: string;
  email: string;
  isSuperAdmin: boolean;
};

export function isSuperAdminEmail(email: string | undefined | null) {
  return Boolean(email && email.trim().toLowerCase() === SUPER_ADMIN_EMAIL);
}

/**
 * Whether a Firebase user may reach the dashboard: either they carry the
 * `admin` custom claim, or they are the super admin. The super admin needs no
 * claim so there is always a way back in if claims get cleared.
 */
export function hasAdminAccess(
  email: string | undefined | null,
  customClaims: Record<string, unknown> | undefined
) {
  return isSuperAdminEmail(email) || customClaims?.admin === true;
}

/**
 * Verifies a session cookie, then re-reads the user's current claims.
 *
 * The claims are read live rather than trusted from the cookie so that a grant
 * takes effect on the next request instead of the next sign-in, and a revoke
 * takes effect immediately. checkRevoked also means a disabled or revoked
 * account stops working straight away.
 */
export async function verifyAdminSessionCookie(
  value: string | undefined
): Promise<AdminSession | null> {
  if (!value) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(value, true);
    const user = await adminAuth.getUser(decoded.uid);

    if (user.disabled || !user.email || !user.emailVerified) {
      return null;
    }

    if (!hasAdminAccess(user.email, user.customClaims)) {
      return null;
    }

    return {
      uid: user.uid,
      email: user.email,
      isSuperAdmin: isSuperAdminEmail(user.email),
    };
  } catch {
    return null;
  }
}

/** For server components and layouts. */
export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSessionCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

/**
 * For route handlers. Returns the session, or the 401 response to return.
 * The proxy only checks that a cookie exists — this is the real gate.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ session: AdminSession; response: null } | { session: null; response: NextResponse }> {
  const session = await verifyAdminSessionCookie(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  );

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, response: null };
}

/** For the admin-management endpoints, which only the super admin may use. */
export async function requireSuperAdmin(
  request: NextRequest
): Promise<{ session: AdminSession; response: null } | { session: null; response: NextResponse }> {
  const result = await requireAdmin(request);

  if (result.response) {
    return result;
  }

  if (!result.session.isSuperAdmin) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Only the super admin can manage admin access." },
        { status: 403 }
      ),
    };
  }

  return result;
}
