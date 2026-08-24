/**
 * Referral codes for Academy membership.
 *
 * One mechanism covers two jobs. A code with no discount attributes a
 * submission to whoever handed it out — that is how a sales rep's output is
 * counted. A code with a discount, up to a full 100%, is how a place is given
 * as a gift or sold at a promotional rate.
 *
 * Deliberately free of imports so both the browser form and the server routes
 * can share the same rules, and so nothing about redemption depends on which
 * side is asking.
 */

import { MEMBERSHIP_FEE_NAIRA } from "./academy";

export type ReferralDiscountType = "percent" | "amount";

export type ReferralCode = {
  /** Normalised, uppercase. Doubles as the Firestore document id. */
  code: string;
  /** Who it belongs to — a rep's name, a partner, or who a gift is from. */
  label: string;
  discountType: ReferralDiscountType;
  /** Percent (0–100) or naira off, depending on discountType. */
  discountValue: number;
  /** null means unlimited — the shape used to track a sales team. */
  maxUses: number | null;
  usageCount: number;
  /** How many of those submissions have since been approved. */
  approvedCount: number;
  active: boolean;
  /** Date-only string (YYYY-MM-DD), or null for no expiry. */
  expiresAt: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
};

/** What gets copied onto a submission when a code is redeemed. */
export type RedeemedReferral = {
  code: string;
  label: string;
  discountType: ReferralDiscountType;
  discountValue: number;
  /** Naira taken off, resolved at redemption time. */
  discountNaira: number;
  /** What the applicant actually owes. */
  finalFeeNaira: number;
  redeemedAt: string;
};

/**
 * Letters, digits and dashes. Uppercase only so codes are unambiguous when
 * read aloud over the phone, which is how most of them will travel.
 */
export const REFERRAL_CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,23}$/;

export const REFERRAL_CODE_MIN_LENGTH = 3;
export const REFERRAL_CODE_MAX_LENGTH = 24;

/**
 * Uppercases, turns runs of whitespace and underscores into single dashes, and
 * drops anything else. Applied on both sides so "gift ada" typed into the form
 * finds the GIFT-ADA the dashboard created.
 */
export function normalizeReferralCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, REFERRAL_CODE_MAX_LENGTH);
}

export function isValidReferralCodeFormat(value: string) {
  return REFERRAL_CODE_PATTERN.test(value);
}

export function formatNaira(amount: number) {
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

/**
 * Resolves a code's discount against a fee. Clamped at both ends: a discount
 * can never exceed the fee or go negative, whatever is stored on the code.
 */
export function applyReferralDiscount(
  discountType: ReferralDiscountType,
  discountValue: number,
  feeNaira: number = MEMBERSHIP_FEE_NAIRA
) {
  const raw =
    discountType === "percent"
      ? (feeNaira * discountValue) / 100
      : discountValue;

  const discountNaira = Math.min(Math.max(Math.round(raw), 0), feeNaira);

  return {
    discountNaira,
    finalFeeNaira: feeNaira - discountNaira,
  };
}

/** Human-readable summary of what a code is worth, for admin and applicant alike. */
export function describeReferralDiscount(
  discountType: ReferralDiscountType,
  discountValue: number,
  feeNaira: number = MEMBERSHIP_FEE_NAIRA
) {
  const { discountNaira, finalFeeNaira } = applyReferralDiscount(
    discountType,
    discountValue,
    feeNaira
  );

  if (discountNaira <= 0) {
    return "No discount — tracking only";
  }

  if (finalFeeNaira <= 0) {
    return "Free membership";
  }

  const off =
    discountType === "percent"
      ? `${discountValue}% off`
      : `${formatNaira(discountValue)} off`;

  return `${off} — pay ${formatNaira(finalFeeNaira)}`;
}

export type ReferralRejection =
  | "not_found"
  | "paused"
  | "expired"
  | "exhausted";

export const REFERRAL_REJECTION_MESSAGES: Record<ReferralRejection, string> = {
  not_found: "We don't recognise that referral code. Check it and try again.",
  paused: "That referral code is no longer active.",
  expired: "That referral code has expired.",
  exhausted: "That referral code has already been used the maximum number of times.",
};

/**
 * Why a code cannot be used right now, or null if it can.
 *
 * `now` is passed in rather than read so the same check runs identically in a
 * Firestore transaction, in the live form lookup, and in a test.
 */
export function referralRejectionReason(
  code: Pick<ReferralCode, "active" | "expiresAt" | "maxUses" | "usageCount">,
  now: Date
): ReferralRejection | null {
  if (!code.active) {
    return "paused";
  }

  // Expiry is a date, not an instant: a code dated today stays usable until
  // that day is over, which is what "expires on the 30th" means to a person.
  if (code.expiresAt) {
    const endOfDay = new Date(`${code.expiresAt}T23:59:59.999`);

    if (!Number.isNaN(endOfDay.getTime()) && now > endOfDay) {
      return "expired";
    }
  }

  if (code.maxUses !== null && code.usageCount >= code.maxUses) {
    return "exhausted";
  }

  return null;
}

const GENERATED_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Builds a code like `GIFT-K7P2QM`. The alphabet omits O/0 and I/1 so a code
 * read over the phone or copied off a flyer cannot be mistyped into a
 * different one.
 */
export function generateReferralCode(prefix = "DXI", randomLength = 6) {
  const cleanPrefix = normalizeReferralCode(prefix);
  let suffix = "";

  for (let i = 0; i < randomLength; i += 1) {
    const index = Math.floor(Math.random() * GENERATED_CODE_ALPHABET.length);
    suffix += GENERATED_CODE_ALPHABET[index];
  }

  return normalizeReferralCode(cleanPrefix ? `${cleanPrefix}-${suffix}` : suffix);
}
