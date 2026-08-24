import { FieldValue } from "firebase-admin/firestore";
import { firestore } from "@/lib/firebase/admin";
import { MEMBERSHIP_FEE_NAIRA } from "@/lib/academy";
import {
  applyReferralDiscount,
  normalizeReferralCode,
  referralRejectionReason,
  type RedeemedReferral,
  type ReferralCode,
  type ReferralRejection,
} from "@/lib/referral";

export const REFERRAL_CODES_COLLECTION = "referralCodes";

export type ReferralLookup =
  | { ok: true; code: ReferralCode }
  | { ok: false; reason: ReferralRejection };

/**
 * Read-only check, used by the form's live lookup. Says whether a code would
 * be accepted right now; it claims nothing about a later submission, which is
 * why redemption re-checks inside a transaction.
 */
export async function lookupReferralCode(rawCode: string): Promise<ReferralLookup> {
  const code = normalizeReferralCode(rawCode);

  if (!code) {
    return { ok: false, reason: "not_found" };
  }

  const snapshot = await firestore.collection(REFERRAL_CODES_COLLECTION).doc(code).get();

  if (!snapshot.exists) {
    return { ok: false, reason: "not_found" };
  }

  const record = { ...(snapshot.data() as ReferralCode), code };
  const rejection = referralRejectionReason(record, new Date());

  return rejection ? { ok: false, reason: rejection } : { ok: true, code: record };
}

/**
 * Claims one use of a code and returns what to store on the submission.
 *
 * The limit is enforced inside a transaction rather than by the read above:
 * two people submitting the last use of a code at the same moment is exactly
 * the case a read-then-write check gets wrong, and here it means giving away a
 * discount that was already spent.
 */
export async function redeemReferralCode(
  rawCode: string
): Promise<{ ok: true; referral: RedeemedReferral } | { ok: false; reason: ReferralRejection }> {
  const code = normalizeReferralCode(rawCode);

  if (!code) {
    return { ok: false, reason: "not_found" };
  }

  const docRef = firestore.collection(REFERRAL_CODES_COLLECTION).doc(code);

  return firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);

    if (!snapshot.exists) {
      return { ok: false as const, reason: "not_found" as const };
    }

    const record = snapshot.data() as ReferralCode;
    const now = new Date();
    const rejection = referralRejectionReason(record, now);

    if (rejection) {
      return { ok: false as const, reason: rejection };
    }

    transaction.update(docRef, {
      usageCount: FieldValue.increment(1),
      lastUsedAt: now.toISOString(),
    });

    const { discountNaira, finalFeeNaira } = applyReferralDiscount(
      record.discountType,
      record.discountValue,
      MEMBERSHIP_FEE_NAIRA
    );

    // The discount is frozen onto the submission at redemption. Editing a code
    // afterwards must not change what someone was already quoted.
    return {
      ok: true as const,
      referral: {
        code,
        label: record.label,
        discountType: record.discountType,
        discountValue: record.discountValue,
        discountNaira,
        finalFeeNaira,
        redeemedAt: now.toISOString(),
      } satisfies RedeemedReferral,
    };
  });
}

/**
 * Counts an approval against the code that brought the submission in.
 *
 * Idempotency is the caller's job — it passes `alreadyCounted` from the
 * submission, which flips to true in the same write. Without that, toggling a
 * status from approved to under review and back would inflate a rep's numbers.
 */
export async function countReferralApproval(code: string) {
  const normalized = normalizeReferralCode(code);

  if (!normalized) {
    return;
  }

  try {
    await firestore
      .collection(REFERRAL_CODES_COLLECTION)
      .doc(normalized)
      .update({ approvedCount: FieldValue.increment(1) });
  } catch (error) {
    // A deleted code should never block a status change.
    console.error(`Could not count an approval against referral code ${normalized}:`, error);
  }
}
