import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { checkInRegistration, searchRegistrations } from "@/lib/firebase/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Door search. Access code first, then name, email or organization.
 *
 * Behind the admin session like everything else under /api/admin: the results
 * carry attendees' phone numbers and email addresses, and a door is a public
 * place.
 */
export async function GET(request: NextRequest) {
  const { response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q") || "";

    if (query.trim().length < 2) {
      return NextResponse.json(
        { error: "Type at least two characters, or a full access code." },
        { status: 400 }
      );
    }

    const results = await searchRegistrations(query, searchParams.get("event") || undefined);

    return NextResponse.json({ results, count: results.length });
  } catch (error) {
    console.error("Check-in search failed:", error);
    return NextResponse.json({ error: "Could not run that search." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { registrationId } = (await request.json()) as { registrationId?: string };

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required." }, { status: 400 });
    }

    const result = await checkInRegistration(registrationId, session.email);

    if (!result.ok) {
      // 409 rather than 400: an already-checked-in guest is a state the door
      // staff need to see, complete with when it happened and who did it.
      return NextResponse.json(
        { error: result.error, registration: result.registration },
        { status: result.registration ? 409 : 404 }
      );
    }

    return NextResponse.json({
      message: "Checked in",
      registration: result.registration,
    });
  } catch (error) {
    console.error("Check-in failed:", error);
    return NextResponse.json({ error: "Could not check that guest in." }, { status: 500 });
  }
}
