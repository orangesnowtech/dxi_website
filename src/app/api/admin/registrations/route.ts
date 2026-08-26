import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { REGISTRATION_STATUSES, type RegistrationStatus } from "@/lib/events";
import { changeRegistrationStatus, listRegistrations } from "@/lib/firebase/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { searchParams } = request.nextUrl;
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 200);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    const result = await listRegistrations({
      eventSlug: searchParams.get("event") || undefined,
      status: (searchParams.get("status") as RegistrationStatus | "all") || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      ...result,
      offset,
      limit,
      viewer: { email: session.email, isSuperAdmin: session.isSuperAdmin },
    });
  } catch (error) {
    console.error("Failed to list registrations:", error);
    return NextResponse.json({ error: "Could not load registrations." }, { status: 500 });
  }
}

/**
 * Moves a registration between statuses.
 *
 * Deliberately silent: nothing is emailed from here. Sends are their own
 * endpoint so a reviewer decides when a registrant hears from us, which is the
 * same split the Academy submissions dashboard uses.
 */
export async function PATCH(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Registration ID is required." }, { status: 400 });
    }

    const { status } = (await request.json()) as { status?: string };

    if (!status || !(REGISTRATION_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${REGISTRATION_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await changeRegistrationStatus(
      id,
      status as RegistrationStatus,
      session.email
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      message: "Registration updated",
      registration: result.registration,
    });
  } catch (error) {
    console.error("Failed to update registration:", error);
    return NextResponse.json({ error: "Could not update the registration." }, { status: 500 });
  }
}
