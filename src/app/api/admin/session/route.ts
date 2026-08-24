import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  hasAdminAccess,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Exchanges a freshly minted Google ID token for an admin session cookie. */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string };

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken, true);

    if (!decoded.email || !decoded.email_verified) {
      return NextResponse.json(
        { error: "This account has no verified email address." },
        { status: 403 }
      );
    }

    const user = await adminAuth.getUser(decoded.uid);

    if (!hasAdminAccess(user.email, user.customClaims)) {
      // Deliberately vague to the browser, specific in the logs.
      console.warn(`Rejected admin sign-in attempt from ${decoded.email}`);
      return NextResponse.json(
        { error: "This account is not authorised to access the dashboard." },
        { status: 403 }
      );
    }

    // Firebase refuses to mint a session cookie from an ID token older than
    // five minutes, which is what keeps a leaked token from being upgraded
    // into a long-lived session later.
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
    });

    const response = NextResponse.json({ email: decoded.email });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Admin session creation failed:", error);
    return NextResponse.json({ error: "Could not start a session." }, { status: 401 });
  }
}

/** Sign out. Revokes refresh tokens so the session cannot be resurrected. */
export async function DELETE(request: NextRequest) {
  const existing = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (existing) {
    try {
      const decoded = await adminAuth.verifySessionCookie(existing);
      await adminAuth.revokeRefreshTokens(decoded.sub);
    } catch {
      // Already invalid — clearing the cookie is all that is left to do.
    }
  }

  const response = NextResponse.json({ message: "Signed out" });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
