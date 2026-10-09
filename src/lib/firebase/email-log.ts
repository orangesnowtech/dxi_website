import { firestore } from "@/lib/firebase/admin";
import { EMAIL_LOG_PAGE_SIZE, type EmailLogEntry } from "@/lib/email-log";

/**
 * A record of every email the site sends.
 *
 * Written from inside `sendZeptoEmail`, so nothing has to remember to log: any
 * route that sends is logged, including ones written later. The body is kept
 * because a log that says "a ticket was sent" cannot answer "what did it say",
 * and because resending needs it.
 */

export const EMAIL_LOG_COLLECTION = "emailLog";

/** Comfortably under Firestore's 1 MB document limit. */
const MAX_HTML_CHARS = 400_000;

const log = () => firestore.collection(EMAIL_LOG_COLLECTION);

function readEntry(snapshot: FirebaseFirestore.DocumentSnapshot): EmailLogEntry {
  return { ...(snapshot.data() as Omit<EmailLogEntry, "id">), id: snapshot.id };
}

type Party = { address?: unknown; name?: unknown };

const text = (value: unknown) => (typeof value === "string" ? value : "");

/**
 * Records one attempt, from the payload exactly as it was handed to ZeptoMail.
 *
 * Never throws. An email that went out must not be reported as failed because
 * the note about it could not be written.
 */
export async function recordEmail(
  payload: Record<string, unknown>,
  outcome: { status: "sent" | "failed"; error?: string },
  resend?: { of: string; by: string }
) {
  try {
    const from = (payload.from || {}) as Party;
    const recipients = Array.isArray(payload.to) ? payload.to : [];
    const first = ((recipients[0] as { email_address?: Party })?.email_address || {}) as Party;
    const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];

    const entry: Omit<EmailLogEntry, "id"> = {
      to: text(first.address),
      toName: text(first.name),
      fromAddress: text(from.address),
      fromName: text(from.name),
      subject: text(payload.subject),
      html: text(payload.htmlbody).slice(0, MAX_HTML_CHARS),
      // Names only: an attached brief can be megabytes, and it is already
      // wherever the form that carried it put it.
      attachments: attachments.map((file) => text((file as { name?: unknown }).name)),
      status: outcome.status,
      error: outcome.error ? outcome.error.slice(0, 1000) : null,
      createdAt: new Date().toISOString(),
      resendOf: resend?.of ?? null,
      resentBy: resend?.by ?? null,
    };

    await log().add(entry);
  } catch (error) {
    console.error("Could not write to the email log:", error);
  }
}

export async function listEmailLog(): Promise<EmailLogEntry[]> {
  const snapshot = await log().orderBy("createdAt", "desc").limit(EMAIL_LOG_PAGE_SIZE).get();
  return snapshot.docs.map(readEntry);
}

export async function getEmailLogEntry(id: string): Promise<EmailLogEntry | null> {
  const snapshot = await log().doc(id).get();
  return snapshot.exists ? readEntry(snapshot) : null;
}
