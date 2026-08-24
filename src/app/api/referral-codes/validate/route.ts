import { NextRequest, NextResponse } from "next/server";
import { MEMBERSHIP_FEE_NAIRA } from "@/lib/academy";
import { lookupReferralCode } from "@/lib/firebase/referral-codes";
import {
  REFERRAL_REJECTION_MESSAGES,
  applyReferralDiscount,
  formatNaira,
  isValidReferralCodeFormat,
  normalizeReferralCode,
} from "@/lib/referral";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public check for the referral field on the business profile form.
 *
 * Answers only what an applicant needs to see — whether the code works and
 * what it is worth. The owner label, the usage count and the remaining uses
 * stay in the dashboard: they are how the sales side is measured, not
 * something to hand to anyone who guesses a code.
 *
 * Nothing is claimed here. The use is only taken when the profile is actually
 * submitted, so an abandoned form never burns a gift code.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = normalizeReferralCode(searchParams.get("code") || "");

  if (!code || !isValidReferralCodeFormat(code)) {
    return NextResponse.json({
      valid: false,
      code,
      reason: "not_found",
      message: REFERRAL_REJECTION_MESSAGES.not_found,
    });
  }

  try {
    const result = await lookupReferralCode(code);

    if (!result.ok) {
      return NextResponse.json({
        valid: false,
        code,
        reason: result.reason,
        message: REFERRAL_REJECTION_MESSAGES[result.reason],
      });
    }

    const { discountNaira, finalFeeNaira } = applyReferralDiscount(
      result.code.discountType,
      result.code.discountValue,
      MEMBERSHIP_FEE_NAIRA
    );

    const message =
      finalFeeNaira <= 0
        ? "Code applied. Your membership is fully covered — there is nothing to pay."
        : discountNaira > 0
          ? `Code applied. ${formatNaira(discountNaira)} off — membership is ${formatNaira(finalFeeNaira)} instead of ${formatNaira(MEMBERSHIP_FEE_NAIRA)}.`
          : "Code applied. We will know who referred you.";

    return NextResponse.json({
      valid: true,
      code,
      discountNaira,
      finalFeeNaira,
      finalFeeLabel: formatNaira(finalFeeNaira),
      message,
    });
  } catch (error) {
    console.error("Referral code lookup failed:", error);
    return NextResponse.json(
      { error: "We could not check that code right now. You can still submit without it." },
      { status: 503 }
    );
  }
}
