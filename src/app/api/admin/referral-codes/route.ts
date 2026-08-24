import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/admin";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-auth";
import {
  REFERRAL_CODE_MAX_LENGTH,
  REFERRAL_CODE_MIN_LENGTH,
  isValidReferralCodeFormat,
  normalizeReferralCode,
  type ReferralCode,
  type ReferralDiscountType,
} from "@/lib/referral";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COLLECTION = "referralCodes";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

type CodePayload = {
  code?: string;
  label?: string;
  discountType?: string;
  discountValue?: number | string;
  maxUses?: number | string | null;
  expiresAt?: string | null;
};

type ParsedSettings = {
  label: string;
  discountType: ReferralDiscountType;
  discountValue: number;
  maxUses: number | null;
  expiresAt: string | null;
};

/**
 * Reads the mutable half of a create/update body and returns either the
 * cleaned values or the first thing wrong with them. Shared so a PATCH cannot
 * drift into accepting something POST rejects.
 */
function parseCodeSettings(
  payload: CodePayload
): { error: string; values: null } | { error: null; values: ParsedSettings } {
  const label = (payload.label || "").trim().slice(0, 120);

  if (!label) {
    return { error: "Tell us who this code belongs to.", values: null };
  }

  const discountType: ReferralDiscountType =
    payload.discountType === "amount" ? "amount" : "percent";
  const discountValue = Number(payload.discountValue ?? 0);

  if (!Number.isFinite(discountValue) || discountValue < 0) {
    return { error: "The discount must be zero or more.", values: null };
  }

  if (discountType === "percent" && discountValue > 100) {
    return { error: "A percentage discount cannot be more than 100%.", values: null };
  }

  // Unlimited is the shape used for sales-team codes, so it is a first-class
  // value rather than a very large number.
  let maxUses: number | null = null;

  if (payload.maxUses !== null && payload.maxUses !== undefined && payload.maxUses !== "") {
    const parsed = Number(payload.maxUses);

    if (!Number.isInteger(parsed) || parsed < 1) {
      return {
        error:
          "The usage limit must be a whole number of at least 1, or left blank for unlimited.",
        values: null,
      };
    }

    maxUses = parsed;
  }

  let expiresAt: string | null = null;

  if (payload.expiresAt) {
    const trimmed = String(payload.expiresAt).trim();

    if (!datePattern.test(trimmed) || Number.isNaN(new Date(`${trimmed}T00:00:00`).getTime())) {
      return { error: "The expiry date is not a valid date.", values: null };
    }

    expiresAt = trimmed;
  }

  return {
    error: null,
    values: { label, discountType, discountValue, maxUses, expiresAt },
  };
}

/** Lists every code with its usage counters. Readable by any admin. */
export async function GET(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const snapshot = await firestore.collection(COLLECTION).orderBy("createdAt", "desc").get();

    const codes = snapshot.docs.map((doc) => ({
      ...(doc.data() as ReferralCode),
      code: doc.id,
    }));

    return NextResponse.json({
      codes,
      viewer: { email: session.email, isSuperAdmin: session.isSuperAdmin },
    });
  } catch (error) {
    console.error("Failed to list referral codes:", error);
    return NextResponse.json({ error: "Could not load referral codes." }, { status: 500 });
  }
}

/**
 * Creates a code. The normalised code is the document id, so create() is what
 * enforces uniqueness — two admins generating at the same moment cannot end up
 * with one code silently overwriting the other's.
 */
export async function POST(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const payload = (await request.json()) as CodePayload;
    const code = normalizeReferralCode(payload.code || "");

    if (code.length < REFERRAL_CODE_MIN_LENGTH || !isValidReferralCodeFormat(code)) {
      return NextResponse.json(
        {
          error: `A code must be ${REFERRAL_CODE_MIN_LENGTH}-${REFERRAL_CODE_MAX_LENGTH} characters of letters, numbers and dashes.`,
        },
        { status: 400 }
      );
    }

    const parsed = parseCodeSettings(payload);

    // Narrowing on `values` rather than `error`: an empty-string error would
    // not exclude the failure branch, and TypeScript is right to say so.
    if (!parsed.values) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const now = new Date().toISOString();
    const record: Omit<ReferralCode, "code"> = {
      ...parsed.values,
      usageCount: 0,
      approvedCount: 0,
      active: true,
      createdAt: now,
      createdBy: session.email,
    };

    try {
      await firestore.collection(COLLECTION).doc(code).create(record);
    } catch (error) {
      // 6 is ALREADY_EXISTS: the code is taken.
      if ((error as { code?: number }).code === 6) {
        return NextResponse.json({ error: `The code ${code} already exists.` }, { status: 409 });
      }

      throw error;
    }

    return NextResponse.json({
      message: `Created ${code}.`,
      referralCode: { ...record, code },
    });
  } catch (error) {
    console.error("Failed to create referral code:", error);
    return NextResponse.json({ error: "Could not create the referral code." }, { status: 500 });
  }
}

/**
 * Updates a code's settings, or pauses and resumes it.
 *
 * The code itself and its counters are never editable: renaming a code that is
 * already on flyers, or resetting a count someone's commission depends on,
 * would both quietly break the tracking this exists for.
 */
export async function PATCH(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { searchParams } = new URL(request.url);
    const code = normalizeReferralCode(searchParams.get("code") || "");

    if (!code) {
      return NextResponse.json({ error: "A referral code is required." }, { status: 400 });
    }

    const payload = (await request.json()) as CodePayload & { active?: boolean };
    const docRef = firestore.collection(COLLECTION).doc(code);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "That referral code does not exist." }, { status: 404 });
    }

    const now = new Date().toISOString();

    // A bare {active} body is the pause/resume toggle; anything more is a full
    // settings edit and gets validated as one.
    if (typeof payload.active === "boolean" && payload.label === undefined) {
      await docRef.update({ active: payload.active, updatedAt: now, updatedBy: session.email });

      return NextResponse.json({
        message: payload.active ? `${code} is active again.` : `${code} is paused.`,
      });
    }

    const parsed = parseCodeSettings(payload);

    // Narrowing on `values` rather than `error`: an empty-string error would
    // not exclude the failure branch, and TypeScript is right to say so.
    if (!parsed.values) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await docRef.update({
      ...parsed.values,
      ...(typeof payload.active === "boolean" ? { active: payload.active } : {}),
      updatedAt: now,
      updatedBy: session.email,
    });

    return NextResponse.json({ message: `Updated ${code}.` });
  } catch (error) {
    console.error("Failed to update referral code:", error);
    return NextResponse.json({ error: "Could not update the referral code." }, { status: 500 });
  }
}

/**
 * Deletes a code outright. Super admin only, and refused once the code has
 * been used — pausing keeps the history that a redeemed submission points at.
 */
export async function DELETE(request: NextRequest) {
  const { session, response: forbidden } = await requireSuperAdmin(request);

  if (forbidden) {
    return forbidden;
  }

  try {
    const { searchParams } = new URL(request.url);
    const code = normalizeReferralCode(searchParams.get("code") || "");

    if (!code) {
      return NextResponse.json({ error: "A referral code is required." }, { status: 400 });
    }

    const docRef = firestore.collection(COLLECTION).doc(code);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "That referral code does not exist." }, { status: 404 });
    }

    const existing = snapshot.data() as ReferralCode;

    if ((existing.usageCount || 0) > 0) {
      return NextResponse.json(
        {
          error: `${code} has been used ${existing.usageCount} time(s). Pause it instead — deleting would orphan those submissions.`,
        },
        { status: 409 }
      );
    }

    await docRef.delete();
    console.info(`${session.email} deleted unused referral code ${code}`);

    return NextResponse.json({ message: `Deleted ${code}.` });
  } catch (error) {
    console.error("Failed to delete referral code:", error);
    return NextResponse.json({ error: "Could not delete the referral code." }, { status: 500 });
  }
}
