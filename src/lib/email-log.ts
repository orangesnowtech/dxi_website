/**
 * One email the site tried to send, as the admin log shows it.
 *
 * Kept apart from the storage module so the dashboard can share the type
 * without pulling firebase-admin into the browser bundle.
 */
export type EmailLogEntry = {
  id: string;
  to: string;
  toName: string;
  fromAddress: string;
  fromName: string;
  subject: string;
  html: string;
  /** File names only. The files themselves are not kept. */
  attachments: string[];
  status: "sent" | "failed";
  /** What ZeptoMail said, when it refused. */
  error: string | null;
  createdAt: string;
  /** Set when this send was a resend of an earlier entry. */
  resendOf: string | null;
  resentBy: string | null;
};

/** How many entries the dashboard loads. The log itself keeps everything. */
export const EMAIL_LOG_PAGE_SIZE = 200;
