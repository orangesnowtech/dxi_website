import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { getZeptoConfig, sendZeptoEmail } from "@/lib/zeptomail";
import { APPLICANT_FROM_NAME, buildRejectionEmail } from "@/lib/emails/academy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_NOTE_LENGTH = 1000;

/**
 * Tells an applicant their profile was not accepted.
 *
 * Same shape as the payment-details send: the status change is reversible and
 * silent, and nothing reaches the applicant until someone deliberately sends it.
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

    const body = (await request.json().catch(() => ({}))) as { note?: string };
    const note = body.note?.trim() || "";

    if (note.length > MAX_NOTE_LENGTH) {
      return NextResponse.json(
        { error: `The note must be ${MAX_NOTE_LENGTH} characters or fewer.` },
        { status: 400 }
      );
    }

    const { token, fromAddress } = getZeptoConfig();

    if (!token || !fromAddress) {
      return NextResponse.json(
        { error: "Email is not configured, so the decision cannot be sent." },
        { status: 503 }
      );
    }

    const docRef = firestore.collection("businessProfileSubmissions").doc(submissionId);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const submission = snapshot.data() as Record<string, string | undefined>;

    if (submission.status !== "rejected") {
      return NextResponse.json(
        { error: "Only submissions marked rejected can be sent a rejection." },
        { status: 409 }
      );
    }

    if (submission.rejectionSentAt && !resend) {
      return NextResponse.json(
        {
          error: `A rejection was already sent on ${new Date(
            submission.rejectionSentAt
          ).toLocaleString("en-NG")}.`,
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
    const email = buildRejectionEmail({ firstName, note });

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
      rejectionSentAt: sentAt,
      rejectionSentBy: session.email,
      rejectionNote: note,
      updatedAt: sentAt,
      updatedBy: session.email,
    });

    return NextResponse.json({
      message: "Rejection sent",
      submissionId,
      rejectionSentAt: sentAt,
    });
  } catch (error) {
    console.error("Failed to send rejection:", error);
    return NextResponse.json(
      { error: "Could not send the rejection email." },
      { status: 500 }
    );
  }
}
