import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getEmailLogEntry, listEmailLog } from "@/lib/firebase/email-log";
import { getZeptoConfig, sendZeptoEmail } from "@/lib/zeptomail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** The most recent emails the site tried to send, newest first. */
export async function GET(request: NextRequest) {
  const { response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    return NextResponse.json({ emails: await listEmailLog() });
  } catch (error) {
    console.error("Failed to list the email log:", error);
    return NextResponse.json({ error: "Could not load the emails." }, { status: 500 });
  }
}

/**
 * Sends a logged email again, exactly as it was: same recipient, same subject,
 * same body. It goes out as a new entry marked as a resend, so the log shows
 * both the original and who repeated it.
 *
 * An attachment is not sent again — the log keeps file names, not files.
 */
export async function POST(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = (await request.json()) as { id?: string };
    const entry = id ? await getEmailLogEntry(id) : null;

    if (!entry) {
      return NextResponse.json({ error: "That email is not in the log." }, { status: 404 });
    }

    if (!entry.to || !entry.html) {
      return NextResponse.json(
        { error: "That entry has no recipient or no body, so there is nothing to send." },
        { status: 400 }
      );
    }

    const { token, fromAddress } = getZeptoConfig();

    if (!token || !fromAddress) {
      return NextResponse.json({ error: "Email sending is not configured." }, { status: 500 });
    }

    await sendZeptoEmail(
      {
        // The address we send from today, in case it has changed since.
        from: { address: fromAddress, name: entry.fromName },
        to: [{ email_address: { address: entry.to, name: entry.toName } }],
        subject: entry.subject,
        htmlbody: entry.html,
      },
      token,
      { of: entry.id, by: session.email }
    );

    return NextResponse.json({ message: `Sent "${entry.subject}" to ${entry.to} again.` });
  } catch (error) {
    console.error("Failed to resend an email:", error);
    return NextResponse.json(
      { error: "The email could not be sent. The attempt is in the log." },
      { status: 502 }
    );
  }
}
