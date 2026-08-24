/**
 * Sends the three applicant-facing Academy emails to an address of your choosing,
 * so the copy and the bank details can be proof-read before a real applicant
 * ever sees them.
 *
 * Renders the same template functions the live routes use, so what lands in the
 * inbox is what actually sends — not a re-typed copy of it.
 *
 * Run with:
 *   node --experimental-strip-types scripts/send-test-email.ts you@example.com
 *
 * Requires ZEPTOMAIL_TOKEN (and ideally ZEPTOMAIL_SENDER_ADDRESS) in .env.local.
 */

import { config } from "dotenv";
import {
  BANK_DETAILS,
  MEMBERSHIP_FEE_LABEL,
  PAYMENT_WINDOW_LABEL,
  bankDetailsAreConfigured,
} from "../src/lib/academy.ts";
import {
  APPLICANT_FROM_NAME,
  buildPaymentDetailsEmail,
  buildRejectionEmail,
  buildSubmissionConfirmationEmail,
} from "../src/lib/emails/academy.ts";

config({ path: ".env.local" });

const recipient = process.argv[2];

if (!recipient) {
  console.error("Usage: node --experimental-strip-types scripts/send-test-email.ts <email>");
  process.exit(1);
}

const token = (process.env.ZEPTOMAIL_TOKEN || process.env.NEXT_PUBLIC_ZEPTOMAIL_TOKEN || "").trim();
const fromAddress = (
  process.env.ZEPTOMAIL_SENDER_ADDRESS ||
  process.env.ZEPTOMAIL_BOUNCE_ADDRESS ||
  "info@dximarketing.com"
).trim();

if (!token) {
  console.error("ZEPTOMAIL_TOKEN is not set in .env.local.");
  process.exit(1);
}

if (!bankDetailsAreConfigured()) {
  console.error("Bank details are still placeholders in src/lib/academy.ts.");
  process.exit(1);
}

async function send(subject: string, html: string, fromName: string) {
  const response = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify({
      from: { address: fromAddress, name: fromName },
      to: [{ email_address: { address: recipient, name: "DXI test" } }],
      subject,
      htmlbody: html,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`ZeptoMail ${response.status}: ${await response.text()}`);
  }

  console.log(`  sent: ${subject}`);
}

async function main() {
  console.log(`Sending test emails to ${recipient} from ${fromAddress}\n`);

  const confirmation = buildSubmissionConfirmationEmail({
    firstName: "Chris",
    supportAreaNeeded: "Marketing and sales",
    businessGoalsNextSixMonths: "Grow monthly revenue and get financing ready.",
    preferredContactMethod: "WhatsApp",
    preferredContactDay: "2026-09-01",
    preferredContactTime: "Afternoon",
  });

  const approval = buildPaymentDetailsEmail({
    firstName: "Chris",
    feeLabel: MEMBERSHIP_FEE_LABEL,
    bankDetails: BANK_DETAILS,
    paymentReference: "DXI-TEST01",
    paymentWindowLabel: PAYMENT_WINDOW_LABEL,
  });

  const rejection = buildRejectionEmail({
    firstName: "Chris",
    note: "Your business is still very early — come back to us once you have a few months of consistent sales behind you.",
  });

  // Prefixed so nobody mistakes a proof for a real decision.
  await send(`[TEST] ${confirmation.subject}`, confirmation.html, APPLICANT_FROM_NAME);
  await send(`[TEST] ${approval.subject}`, approval.html, APPLICANT_FROM_NAME);
  await send(`[TEST] ${rejection.subject}`, rejection.html, APPLICANT_FROM_NAME);

  console.log("\nAll test emails sent.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
