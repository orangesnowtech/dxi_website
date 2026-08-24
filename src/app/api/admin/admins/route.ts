import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import {
  SUPER_ADMIN_EMAIL,
  isSuperAdminEmail,
  requireAdmin,
  requireSuperAdmin,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AdminRecord = {
  uid: string;
  email: string;
  isSuperAdmin: boolean;
  disabled: boolean;
  lastSignInAt: string | null;
  createdAt: string | null;
};

/**
 * Lists everyone who can reach the dashboard. Readable by any admin — knowing
 * who else has access is not privileged information, and it makes it obvious
 * if an unexpected account appears.
 */
export async function GET(request: NextRequest) {
  const { response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const admins: AdminRecord[] = [];
    let pageToken: string | undefined;

    // The user pool here is a handful of staff accounts, so paging through it
    // is cheaper and simpler than keeping a separate index of admins.
    do {
      const page = await adminAuth.listUsers(1000, pageToken);

      for (const user of page.users) {
        const isSuper = isSuperAdminEmail(user.email);

        if (!isSuper && user.customClaims?.admin !== true) {
          continue;
        }

        admins.push({
          uid: user.uid,
          email: user.email || "(no email)",
          isSuperAdmin: isSuper,
          disabled: user.disabled,
          lastSignInAt: user.metadata.lastSignInTime || null,
          createdAt: user.metadata.creationTime || null,
        });
      }

      pageToken = page.pageToken;
    } while (pageToken);

    admins.sort((a, b) => {
      if (a.isSuperAdmin !== b.isSuperAdmin) return a.isSuperAdmin ? -1 : 1;
      return a.email.localeCompare(b.email);
    });

    return NextResponse.json({ admins, superAdminEmail: SUPER_ADMIN_EMAIL });
  } catch (error) {
    console.error("Failed to list admins:", error);
    return NextResponse.json({ error: "Could not list admins." }, { status: 500 });
  }
}

/** Grants admin access. Creates the Firebase user if they have never signed in. */
export async function POST(request: NextRequest) {
  const { session, response: forbidden } = await requireSuperAdmin(request);

  if (forbidden) {
    return forbidden;
  }

  try {
    const { email } = (await request.json()) as { email?: string };
    const normalized = email?.trim().toLowerCase();

    if (!normalized || !emailPattern.test(normalized)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    let user;

    try {
      user = await adminAuth.getUserByEmail(normalized);
    } catch (error) {
      if ((error as { code?: string }).code !== "auth/user-not-found") {
        throw error;
      }

      // Created without a provider so their first Google sign-in attaches to
      // this record rather than making a second one.
      user = await adminAuth.createUser({ email: normalized, emailVerified: true });
    }

    if (user.customClaims?.admin === true) {
      return NextResponse.json(
        { error: `${normalized} already has admin access.` },
        { status: 409 }
      );
    }

    await adminAuth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true });
    console.info(`${session.email} granted admin access to ${normalized}`);

    return NextResponse.json({ message: `${normalized} can now access the dashboard.` });
  } catch (error) {
    console.error("Failed to grant admin access:", error);
    return NextResponse.json({ error: "Could not grant admin access." }, { status: 500 });
  }
}

/** Revokes admin access and ends any session that account currently holds. */
export async function DELETE(request: NextRequest) {
  const { session, response: forbidden } = await requireSuperAdmin(request);

  if (forbidden) {
    return forbidden;
  }

  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "A uid is required." }, { status: 400 });
    }

    const user = await adminAuth.getUser(uid);

    if (isSuperAdminEmail(user.email)) {
      return NextResponse.json(
        { error: "The super admin cannot have their own access removed." },
        { status: 400 }
      );
    }

    const { admin: _removed, ...remainingClaims } = user.customClaims || {};
    await adminAuth.setCustomUserClaims(uid, remainingClaims);

    // Claims are re-read on every request, so this is already enough to lock
    // them out. Revoking as well ends the session immediately and forces a
    // fresh sign-in rather than leaving a dead cookie in their browser.
    await adminAuth.revokeRefreshTokens(uid);
    console.info(`${session.email} revoked admin access from ${user.email}`);

    return NextResponse.json({ message: `Removed admin access from ${user.email}.` });
  } catch (error) {
    console.error("Failed to revoke admin access:", error);
    return NextResponse.json({ error: "Could not revoke admin access." }, { status: 500 });
  }
}
