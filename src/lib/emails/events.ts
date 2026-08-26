import { escapeHtml, type BankDetails, type BuiltEmail } from "./academy";

/**
 * Registrant-facing email for the event portal.
 *
 * Same contract as the Academy templates: no side effects, every value passed
 * in, so the copy can be proof-read by rendering it outside Next. The only
 * import is `escapeHtml`, which is itself import-free.
 *
 * Three emails carry the whole flow — received, pay this, you're in — and each
 * one is written so that receiving it out of order still makes sense, because
 * with a manual transfer in the middle they sometimes will be.
 */

export const EVENTS_FROM_NAME = "DXI Events";

export type EventEmailFacts = {
  eventTitle: string;
  /** Already formatted for Lagos, e.g. "Wednesday, 12 March 2026 · 4:00 PM". */
  when: string;
  /** "Online" or the venue line. */
  where: string;
  typeLabel: string;
};

const wrap = (heading: string, body: string) => `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.6;">
        <h2 style="margin:0 0 16px;color:#b91c1c;">${heading}</h2>
        ${body}
        <p style="margin-top:20px;">See you there,<br />The DXI Events Team</p>
      </div>
    `;

const detailsTable = (facts: EventEmailFacts) => `
        <table style="border-collapse:collapse;margin:16px 0;background:#f9fafb;width:100%;max-width:520px;">
          <tr><td style="padding:8px 12px;"><strong>Event</strong></td><td style="padding:8px 12px;">${escapeHtml(facts.eventTitle)}</td></tr>
          <tr><td style="padding:8px 12px;"><strong>When</strong></td><td style="padding:8px 12px;">${escapeHtml(facts.when)}</td></tr>
          <tr><td style="padding:8px 12px;"><strong>Where</strong></td><td style="padding:8px 12px;">${escapeHtml(facts.where)}</td></tr>
          <tr><td style="padding:8px 12px;"><strong>Registered as</strong></td><td style="padding:8px 12px;">${escapeHtml(facts.typeLabel)}</td></tr>
        </table>
`;

/**
 * Sent when a registration needs a person to look at it before it is anything.
 *
 * Carries no access code on purpose. A code in this email would read as a
 * ticket, and a vendor who has not been given a stand yet does not have one.
 */
export function buildRegistrationReceivedEmail(input: {
  firstName: string;
  facts: EventEmailFacts;
  /** Set when the place will cost something once approved. */
  feeLabel?: string;
}): BuiltEmail {
  const feeNote = input.feeLabel
    ? `<p style="margin:16px 0;padding:12px 16px;background:#f9fafb;border-left:3px solid #b91c1c;">
           If your application is accepted, this place is ${escapeHtml(input.feeLabel)}. We will
           send you the payment details then &mdash; please do not send any money before that.
         </p>`
    : "";

  return {
    subject: `We have received your registration — ${input.facts.eventTitle}`,
    html: wrap(
      "Thanks — we have your application",
      `
        <p>Hi ${escapeHtml(input.firstName)},</p>
        <p>
          We have received your application for the place below. Applications of this kind are
          reviewed by our team before a place is confirmed, so this is not a ticket yet.
        </p>
        ${detailsTable(input.facts)}
        ${feeNote}
        <p>
          <strong>What happens next:</strong> we will review your application and come back to you
          either way. If you are accepted, your confirmation and entry code arrive in a separate
          email.
        </p>
        <p>If anything needs changing in the meantime, just reply to this email.</p>
      `
    ),
  };
}

/**
 * Sent when there is money to collect.
 *
 * Paystack is not live yet — see `lib/academy.ts` — so this repeats the
 * Academy's transfer flow, including the warning about personal accounts. The
 * reference is the registrant's own access code, so a payment that arrives
 * with nothing else attached can still be matched to a person.
 */
export function buildEventPaymentDetailsEmail(input: {
  firstName: string;
  facts: EventEmailFacts;
  /** What they owe, already formatted. */
  amountLabel: string;
  bankDetails: BankDetails;
  paymentReference: string;
  paymentWindowLabel: string;
}): BuiltEmail {
  const { bankDetails: bank } = input;
  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 12px;"><strong>${escapeHtml(label)}</strong></td><td style="padding:8px 12px;">${escapeHtml(value)}</td></tr>`;

  return {
    subject: `Your place is held — ${input.facts.eventTitle}`,
    html: wrap(
      "You're accepted. Here is how to pay.",
      `
        <p>Hi ${escapeHtml(input.firstName)},</p>
        <p>We are holding your place at:</p>
        ${detailsTable(input.facts)}
        <p>
          We are currently accepting payment by direct bank transfer only. Please send
          ${escapeHtml(input.amountLabel)} to:
        </p>
        <table style="border-collapse:collapse;margin:16px 0;background:#f9fafb;width:100%;max-width:520px;">
          ${row("Bank", bank.bankName)}
          ${row("Account name", bank.accountName)}
          ${row("Account number", bank.accountNumber)}
          ${row("Amount", input.amountLabel)}
          ${row("Reference", input.paymentReference)}
        </table>
        <p>
          Use <strong>${escapeHtml(input.paymentReference)}</strong> as the transfer narration so we
          can match your payment, and reply to this email with your proof of payment. Your place is
          held for ${escapeHtml(input.paymentWindowLabel)}.
        </p>
        <p>
          Once we confirm the transfer we will send your entry code, and you are in.
        </p>
        <p style="margin-top:12px;color:#6b7280;font-size:13px;">
          We will never ask you to send money to a personal account or to any details other than
          those above. If anything looks off, reply to this email before paying.
        </p>
      `
    ),
  };
}

/**
 * The ticket. The only email that carries the access code, and the only one
 * that carries a join link for an online event.
 */
export function buildEventTicketEmail(input: {
  firstName: string;
  facts: EventEmailFacts;
  accessCode: string;
  /** Only for online events, and only ever here. */
  joinUrl?: string;
  /** Set when the place was paid for, so the email doubles as a receipt. */
  paidLabel?: string;
}): BuiltEmail {
  const joinBlock = input.joinUrl
    ? `<p style="margin:16px 0;padding:12px 16px;background:#f9fafb;border-left:3px solid #b91c1c;">
           Join here when it starts:<br />
           <a href="${escapeHtml(input.joinUrl)}" style="color:#b91c1c;font-weight:bold;">${escapeHtml(input.joinUrl)}</a><br />
           <span style="color:#6b7280;font-size:13px;">This link is yours &mdash; please do not forward it.</span>
         </p>`
    : `<p>
           Please arrive about 15 minutes early. Have the code above ready on your phone or
           printed &mdash; it is how we check you in at the door.
         </p>`;

  const paidBlock = input.paidLabel
    ? `<p style="color:#6b7280;font-size:13px;">Payment received: ${escapeHtml(input.paidLabel)}. This email is your receipt.</p>`
    : "";

  return {
    subject: `You're in — ${input.facts.eventTitle}`,
    html: wrap(
      "You're confirmed.",
      `
        <p>Hi ${escapeHtml(input.firstName)},</p>
        <p>Your place is confirmed. Here are the details:</p>
        ${detailsTable(input.facts)}
        <div style="margin:24px 0;padding:20px;text-align:center;border:2px solid #b91c1c;background:#f9fafb;">
          <p style="margin:0 0 8px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">Your entry code</p>
          <p style="margin:0;font-family:'Courier New',monospace;font-size:34px;font-weight:bold;letter-spacing:6px;color:#111827;">${escapeHtml(input.accessCode)}</p>
        </div>
        ${joinBlock}
        ${paidBlock}
        <p>If your plans change, reply to this email and let us know so we can free the place up.</p>
      `
    ),
  };
}

/**
 * Sent when an application is not accepted.
 *
 * A fixed, considerate baseline, with an optional reviewer note appended —
 * same shape as the Academy rejection, for the same reason: everyone gets the
 * same message unless there is something specific worth saying.
 */
export function buildEventRejectionEmail(input: {
  firstName: string;
  facts: EventEmailFacts;
  note?: string;
}): BuiltEmail {
  const note = input.note?.trim();

  const noteBlock = note
    ? `<div style="margin:16px 0;padding:14px 16px;background:#f9fafb;border-left:3px solid #b91c1c;">
             <p style="margin:0;white-space:pre-wrap;">${escapeHtml(note)}</p>
           </div>`
    : "";

  return {
    subject: `An update on your registration — ${input.facts.eventTitle}`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.6;">
        <h2 style="margin:0 0 16px;color:#111827;">An update on your registration</h2>
        <p>Hi ${escapeHtml(input.firstName)},</p>
        <p>
          Thank you for applying for a place at <strong>${escapeHtml(input.facts.eventTitle)}</strong>
          as a ${escapeHtml(input.facts.typeLabel.toLowerCase())}. We have reviewed your
          application carefully.
        </p>
        <p>
          On this occasion we are not able to offer you a place. Space is limited and we take a
          fixed number for each event &mdash; this is not a judgement on you or your business.
        </p>
        ${noteBlock}
        <p>
          We run events regularly, and you are very welcome to apply for the next one. If you have
          questions about this decision, just reply to this email.
        </p>
        <p style="margin-top:20px;">With thanks,<br />The DXI Events Team</p>
      </div>
    `,
  };
}

/** The internal heads-up. Everything a reviewer needs before opening the dashboard. */
export function buildEventAdminNotificationEmail(input: {
  facts: EventEmailFacts;
  fullName: string;
  email: string;
  phone: string;
  organizationName: string;
  jobTitle: string;
  socialMediaUrl: string;
  howDidYouHear: string;
  notes: string;
  status: string;
  feeLabel: string;
  accessCode: string;
  vendor: {
    businessName: string;
    offering: string;
    boothPreference: string;
    repCount: string;
  } | null;
}): BuiltEmail {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 8px;"><strong>${escapeHtml(label)}</strong></td><td style="padding:6px 8px;">${escapeHtml(value || "Not provided")}</td></tr>`;

  const vendorBlock = input.vendor
    ? `<h3 style="margin:20px 0 8px;">Vendor Details</h3>
         <table style="border-collapse:collapse;width:100%;max-width:700px;">
           ${row("Business name", input.vendor.businessName)}
           ${row("What they exhibit", input.vendor.offering)}
           ${row("Booth preference", input.vendor.boothPreference)}
           ${row("Representatives", input.vendor.repCount)}
         </table>`
    : "";

  return {
    subject: `New event registration — ${input.facts.eventTitle} (${input.fullName})`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.5;">
        <h2 style="margin:0 0 16px;color:#b91c1c;">New Event Registration</h2>
        <h3 style="margin:20px 0 8px;">Event</h3>
        <table style="border-collapse:collapse;width:100%;max-width:700px;">
          ${row("Event", input.facts.eventTitle)}
          ${row("When", input.facts.when)}
          ${row("Registering as", input.facts.typeLabel)}
          ${row("Fee", input.feeLabel)}
          ${row("Status", input.status)}
          ${row("Access code", input.accessCode)}
        </table>

        <h3 style="margin:20px 0 8px;">Registrant</h3>
        <table style="border-collapse:collapse;width:100%;max-width:700px;">
          ${row("Name", input.fullName)}
          ${row("Email", input.email)}
          ${row("Phone", input.phone)}
          ${row("Organization", input.organizationName)}
          ${row("Job title", input.jobTitle)}
          ${row("Social / website", input.socialMediaUrl)}
          ${row("Heard about it via", input.howDidYouHear)}
        </table>
        ${vendorBlock}
        ${input.notes ? `<h3 style="margin:20px 0 8px;">Notes</h3><p style="margin:0;white-space:pre-wrap;">${escapeHtml(input.notes)}</p>` : ""}
      </div>
    `,
  };
}
