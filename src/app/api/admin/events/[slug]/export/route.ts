import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import type { EventRegistration } from "@/lib/events";
import { getEvent, listRegistrations } from "@/lib/firebase/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ slug: string }> };

/**
 * One escaped CSV field.
 *
 * Quoting everything rather than only what needs it: a Nigerian address with a
 * comma in it, or a name with an apostrophe, is the common case here, and a
 * rule with no exceptions cannot be got wrong at the one call site that
 * forgets.
 */
function csvField(value: unknown) {
  if (value === null || value === undefined) {
    return '""';
  }

  return `"${String(value).replace(/"/g, '""')}"`;
}

const COLUMNS: { header: string; read: (row: EventRegistration) => unknown }[] = [
  { header: "Name", read: (row) => row.fullName },
  { header: "Email", read: (row) => row.email },
  { header: "Phone", read: (row) => row.phone },
  { header: "Organisation", read: (row) => row.organizationName },
  { header: "Job title", read: (row) => row.jobTitle },
  { header: "Ticket", read: (row) => row.typeLabel },
  { header: "Status", read: (row) => row.status },
  { header: "Fee (NGN)", read: (row) => row.feeNaira },
  { header: "Paid at", read: (row) => row.paidAt },
  { header: "Access code", read: (row) => row.accessCode },
  { header: "Checked in", read: (row) => (row.checkedIn ? "yes" : "no") },
  { header: "Checked in at", read: (row) => row.checkedInAt },
  { header: "How they heard", read: (row) => row.howDidYouHear },
  { header: "Expectations", read: (row) => row.expectations },
  { header: "Notes", read: (row) => row.notes },
  { header: "Registered at", read: (row) => row.submittedAt },
];

/**
 * The registration list as a spreadsheet.
 *
 * Exists mainly to be pressed immediately before an event is deleted: those
 * rows are the only record that some of these people ever paid us, and once
 * the delete runs there is nothing to reconstruct them from. Useful on its own
 * terms too, for a badge run or a follow-up list.
 *
 * Any admin may export; only the super admin may delete. Reading the list is
 * something the people running the door need to do.
 */
export async function GET(request: NextRequest, { params }: Context) {
  const { response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { slug } = await params;

  try {
    const event = await getEvent(slug);

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    // One page, deliberately large. An event with more registrations than this
    // is a good problem, and the truncation is reported rather than silent.
    const page = await listRegistrations({ eventSlug: slug, limit: 10000, offset: 0 });

    if (page.hasMore) {
      console.warn(
        `Export for ${slug} was truncated: ${page.total} registrations, 10000 exported.`
      );
    }

    const rows = [
      COLUMNS.map((column) => csvField(column.header)).join(","),
      ...page.registrations.map((row) =>
        COLUMNS.map((column) => csvField(column.read(row))).join(",")
      ),
    ];

    // Excel reads a bare UTF-8 CSV as the system codepage and mangles every
    // accented name in it. The byte order mark is what makes it read UTF-8.
    const body = `﻿${rows.join("\r\n")}\r\n`;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}-registrations.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(`Failed to export registrations for ${slug}:`, error);
    return NextResponse.json({ error: "Could not build the export." }, { status: 500 });
  }
}
