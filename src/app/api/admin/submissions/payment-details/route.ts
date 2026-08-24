import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import {
  BANK_DETAILS,
  MEMBERSHIP_FEE_LABEL,
  MEMBERSHIP_FEE_NAIRA,
  PAYMENT_WINDOW_LABEL,
  bankDetailsAreConfigured,
} from "@/lib/academy";
import { formatNaira, type RedeemedReferral } from "@/lib/referral";
import { getZeptoConfig, sendZeptoEmail } from "@/lib/zeptomail";
import { APPLICANT_FROM_NAME, buildPaymentDetailsEmail } from "@/lib/emails/academy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Sends manual bank-transfer instructions to an approved applicant.
 *
 * Deliberately separate from the status update: changing a status is cheap and
 * reversible, emailing a real person is not. Nothing goes out unless someone
 * approves the submission first and then explicitly asks to send.
 */
export async function POST(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get("id");
    const resend = searchParams.get("resend") === "true";

    if (!submissionId) {
      return NextResponse.json({ error: "Submission ID is required" }, { status: 400 });
    }

    if (!bankDetailsAreConfigured()) {
      return NextResponse.json(
        {
          error:
            "Bank account details are not configured yet. Set them in src/lib/academy.ts before sending payment instructions.",
        },
        { status: 503 }
      );
    }

    const { token, fromAddress } = getZeptoConfig();

    if (!token || !fromAddress) {
      return NextResponse.json(
        { error: "Email is not configured, so payment instructions cannot be sent." },
        { status: 503 }
      );
    }

    const docRef = firestore.collection("businessProfileSubmissions").doc(submissionId);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const submission = snapshot.data() as Record<string, unknown> & {
      status?: string;
      emailAddress?: string;
      firstName?: string;
      fullName?: string;
      paymentDetailsSentAt?: string;
      referral?: RedeemedReferral | null;
    };

    if (submission.status !== "approved") {
      return NextResponse.json(
        { error: "Only approved submissions can be sent payment details." },
        { status: 409 }
      );
    }

    if (submission.paymentDetailsSentAt && !resend) {
      return NextResponse.json(
        {
          error: `Payment details were already sent on ${new Date(
            submission.paymentDetailsSentAt
          ).toLocaleString("en-NG")}. Re-send explicitly if that was intended.`,
          alreadySent: true,
        },
        { status: 409 }
      );
    }

    const applicantEmail = submission.emailAddress?.trim();

    if (!applicantEmail) {
      return NextResponse.json(
        { error: "This submission has no email address on file." },
        { status: 422 }
      );
    }

    const firstName = submission.firstName?.trim() || "there";
    const fullName = submission.fullName?.trim() || firstName;

    // Gives the finance side something to match a transfer against.
    const paymentReference = `DXI-${submissionId.slice(0, 6).toUpperCase()}`;

    // The discount is read off the submission, not recomputed from the code:
    // whatever the applicant was quoted when they applied is what they owe,
    // even if the code has since been edited or paused.
    const redeemed = submission.referral || null;

    const email = buildPaymentDetailsEmail({
      firstName,
      feeLabel: MEMBERSHIP_FEE_LABEL,
      bankDetails: BANK_DETAILS,
      paymentReference,
      paymentWindowLabel: PAYMENT_WINDOW_LABEL,
      referral:
        redeemed && redeemed.discountNaira > 0
          ? {
              code: redeemed.code,
              discountLabel: formatNaira(redeemed.discountNaira),
              payableLabel: formatNaira(redeemed.finalFeeNaira),
              fullyCovered: redeemed.finalFeeNaira <= 0,
            }
          : undefined,
    });

    await sendZeptoEmail(
      {
        from: { address: fromAddress, name: APPLICANT_FROM_NAME },
        to: [{ email_address: { address: applicantEmail, name: fullName } }],
        subject: email.subject,
        htmlbody: email.html,
      },
      token
    );

    const sentAt = new Date().toISOString();

    await docRef.update({
      paymentDetailsSentAt: sentAt,
      paymentDetailsSentBy: session.email,
      paymentReference,
      // What we actually asked them for, so the finance side can reconcile a
      // discounted transfer without re-deriving it from the code.
      amountRequestedNaira: redeemed ? redeemed.finalFeeNaira : MEMBERSHIP_FEE_NAIRA,
      updatedAt: sentAt,
      updatedBy: session.email,
    });

    return NextResponse.json({
      message: "Payment details sent",
      submissionId,
      paymentDetailsSentAt: sentAt,
      paymentReference,
      amountRequestedNaira: redeemed ? redeemed.finalFeeNaira : MEMBERSHIP_FEE_NAIRA,
    });
  } catch (error) {
    console.error("Failed to send payment details:", error);
    return NextResponse.json(
      { error: "Could not send the payment details email." },
      { status: 500 }
    );
  }
}
