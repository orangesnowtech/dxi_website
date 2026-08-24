import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import type { DocumentData, Query } from "firebase-admin/firestore";
import { firestore } from "@/lib/firebase/admin";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-auth";
import {
  ACTIVE_SUBMISSION_STATUSES,
  SUBMISSION_STATUSES,
} from "@/lib/submission-status";
import { countReferralApproval } from "@/lib/firebase/referral-codes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const collection = firestore.collection("businessProfileSubmissions");

    // Three cases: a named status, "all" for everything including archived, or
    // the default, which hides archived so the working list stays the list of
    // things still needing attention.
    const applyScope = (base: Query<DocumentData>) => {
      if (status === "all") {
        return base;
      }

      if (status) {
        return base.where("status", "==", status);
      }

      return base.where("status", "in", ACTIVE_SUBMISSION_STATUSES);
    };

    const query: Query<DocumentData> = applyScope(collection);

    // Sort by creation date (newest first) and apply pagination
    const snapshot = await query.orderBy("createdAt", "desc").limit(limit + 1).offset(offset).get();

    const submissions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Count over the same scope, or the pager reports totals the list never shows.
    const countSnapshot = await applyScope(collection).count().get();

    return NextResponse.json({
      submissions,
      total: countSnapshot.data().count,
      hasMore: submissions.length > limit,
      offset,
      limit,
      viewer: { email: session.email, isSuperAdmin: session.isSuperAdmin },
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get("id");
    const { status } = await request.json();

    if (!submissionId) {
      return NextResponse.json(
        { error: "Submission ID is required" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    if (!SUBMISSION_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${SUBMISSION_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const docRef = firestore.collection("businessProfileSubmissions").doc(submissionId);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const submission = snapshot.data() as {
      referralCode?: string;
      referralApprovalCounted?: boolean;
    };

    // An approval is counted once per submission, ever. Statuses move back and
    // forth during a review, and a rep's numbers must not grow each time.
    const countsAnApproval =
      status === "approved" &&
      Boolean(submission.referralCode) &&
      !submission.referralApprovalCounted;

    await docRef.update({
      status,
      ...(countsAnApproval ? { referralApprovalCounted: true } : {}),
      updatedAt: new Date().toISOString(),
      updatedBy: session.email,
    });

    if (countsAnApproval && submission.referralCode) {
      await countReferralApproval(submission.referralCode);
    }

    return NextResponse.json({
      message: "Submission updated successfully",
      submissionId,
      status,
    });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}

/**
 * Permanently deletes a submission. Super admin only.
 *
 * This is a hard delete, not a flag: the point is to be able to honour an
 * erasure request over data that includes revenue, debt and financing history.
 * Archiving is the reversible option and should be the everyday one.
 *
 * A minimal audit record is kept — who deleted what and when, with no personal
 * data in it, so accountability survives without defeating the erasure.
 */
export async function DELETE(request: NextRequest) {
  const { session, response: forbidden } = await requireSuperAdmin(request);

  if (forbidden) {
    return forbidden;
  }

  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get("id");

    if (!submissionId) {
      return NextResponse.json({ error: "Submission ID is required" }, { status: 400 });
    }

    const docRef = firestore.collection("businessProfileSubmissions").doc(submissionId);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const submission = snapshot.data() as Record<string, string | undefined>;

    // Confirmation is checked server-side too — the browser dialog is a
    // convenience, not the safeguard.
    const { confirmName } = (await request.json().catch(() => ({}))) as {
      confirmName?: string;
    };
    const expectedName = (submission.fullName || "").trim();

    if (!confirmName || confirmName.trim().toLowerCase() !== expectedName.toLowerCase()) {
      return NextResponse.json(
        { error: "The typed name did not match this submission." },
        { status: 400 }
      );
    }

    await docRef.delete();

    await firestore.collection("submissionDeletions").add({
      submissionId,
      deletedBy: session.email,
      deletedAt: FieldValue.serverTimestamp(),
      previousStatus: submission.status || null,
    });

    console.warn(`${session.email} permanently deleted submission ${submissionId}`);

    return NextResponse.json({ message: "Submission permanently deleted", submissionId });
  } catch (error) {
    console.error("Failed to delete submission:", error);
    return NextResponse.json({ error: "Could not delete the submission." }, { status: 500 });
  }
}
