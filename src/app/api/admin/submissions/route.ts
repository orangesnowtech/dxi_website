import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = firestore.collection("businessProfileSubmissions");

    // Filter by status if provided
    if (status) {
      query = query.where("status", "==", status);
    }

    // Sort by creation date (newest first) and apply pagination
    const snapshot = await query.orderBy("createdAt", "desc").limit(limit + 1).offset(offset).get();

    const submissions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count for pagination
    const countSnapshot = await (status
      ? firestore.collection("businessProfileSubmissions").where("status", "==", status)
      : firestore.collection("businessProfileSubmissions")
    ).count().get();

    return NextResponse.json({
      submissions,
      total: countSnapshot.data().count,
      hasMore: submissions.length > limit,
      offset,
      limit,
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

    const validStatuses = ["new", "contacted", "qualified", "rejected", "archived"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    await firestore.collection("businessProfileSubmissions").doc(submissionId).update({
      status,
      updatedAt: new Date().toISOString(),
    });

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
