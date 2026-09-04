import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { RECORDING_ACCESS_LABELS, type RecordingAccess } from "@/lib/recordings";
import { getRecording, listWatchers } from "@/lib/firebase/recordings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ slug: string }> };

/** Quoted unconditionally — a name with a comma in it is the common case. */
function csvField(value: unknown) {
  if (value === null || value === undefined) {
    return '""';
  }

  return `"${String(value).replace(/"/g, '""')}"`;
}

/**
 * The watch list as a spreadsheet.
 *
 * These are people who raised their hand after the room emptied, which makes
 * this a call list rather than an analytics export. It goes where the follow-up
 * happens — a CRM, a phone, a colleague — and that means a file, not a screen.
 */
export async function GET(request: NextRequest, { params }: Context) {
  const { response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { slug } = await params;

  try {
    const recording = await getRecording(slug);

    if (!recording) {
      return NextResponse.json({ error: "That replay does not exist." }, { status: 404 });
    }

    const watchers = await listWatchers(slug);

    const rows = [
      ["Watched at", "Name", "Email", "Phone", "How they got in"].map(csvField).join(","),
      ...watchers.map((watch) =>
        [
          csvField(watch.at),
          csvField(watch.name),
          csvField(watch.watcher),
          csvField(watch.phone),
          csvField(
            RECORDING_ACCESS_LABELS[watch.access as RecordingAccess] || watch.access
          ),
        ].join(",")
      ),
    ];

    // Without the byte order mark Excel reads UTF-8 as the system codepage and
    // mangles every accented name in the file.
    const body = `﻿${rows.join("\r\n")}\r\n`;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}-watchers.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(`Failed to export watchers for ${slug}:`, error);
    return NextResponse.json({ error: "Could not build the export." }, { status: 500 });
  }
}
