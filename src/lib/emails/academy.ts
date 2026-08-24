/**
 * Applicant-facing email templates for the Academy.
 *
 * Deliberately free of imports and side effects: every value the templates
 * need is passed in. That keeps them renderable outside Next — see
 * scripts/send-test-email.ts — so the copy and the bank details can be
 * proof-read against what actually sends, rather than against a copy of it.
 */

/**
 * The display name applicants see in their inbox. Kept here, next to the
 * templates and the sign-offs, so the two cannot drift apart.
 * The from-address itself stays ZEPTOMAIL_SENDER_ADDRESS — changing that needs
 * sender verification in ZeptoMail.
 */
export const APPLICANT_FROM_NAME = "Oreva from DXI Marketing";

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export type BuiltEmail = {
  subject: string;
  html: string;
};

export type BankDetails = {
  bankName: string;
  accountName: string;
  accountNumber: string;
};

export type SubmissionConfirmationInput = {
  firstName: string;
  supportAreaNeeded?: string;
  businessGoalsNextSixMonths?: string;
  preferredContactMethod: string;
  preferredContactDay?: string;
  preferredContactTime?: string;
  /** Set when a referral code was accepted with the submission. */
  referralCode?: string;
  /** Naira taken off, already formatted. Absent for a tracking-only code. */
  referralDiscountLabel?: string;
  /** What they would owe if approved, already formatted. */
  referralFinalFeeLabel?: string;
};

/** Sent the moment a profile is submitted. Promises a review, not a place. */
export function buildSubmissionConfirmationEmail(
  input: SubmissionConfirmationInput
): BuiltEmail {
  const fallback = (value?: string) => escapeHtml(value?.trim() || "Not provided");

  // Confirms the code landed, without promising a place — approval still
  // comes first, and the discount only matters if they get one.
  const referralBlock = input.referralCode
    ? `<p style="margin:16px 0;padding:12px 16px;background:#f9fafb;border-left:3px solid #b91c1c;">
           Referral code <strong>${escapeHtml(input.referralCode)}</strong> has been applied to
           your application.${
             input.referralDiscountLabel
               ? ` If you are approved, your membership will be ${escapeHtml(
                   input.referralFinalFeeLabel || ""
                 )} instead of the usual rate &mdash; a saving of ${escapeHtml(
                   input.referralDiscountLabel
                 )}.`
               : ""
           }
         </p>`
    : "";

  return {
    subject: "We have received your business profile",
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.5;">
        <h2 style="margin:0 0 16px;color:#b91c1c;">Thank You For Your Submission</h2>
        <p>Hi ${escapeHtml(input.firstName)},</p>
        <p>
          We have received your business profile. Every profile goes through a review by
          our team before a place in the DXI Academy is offered &mdash; we look at where
          your business is today and whether the Academy is the right next step for you.
        </p>
        <p>
          <strong>What happens next:</strong> we will review your profile and get back to
          you either way. If your application is approved, we will send you the membership
          payment details in a separate email. Please do not send any payment until you
          receive that email from us.
        </p>
        ${referralBlock}
        <p>Here is a quick summary of what you submitted:</p>
        <ul>
          <li><strong>Support area:</strong> ${fallback(input.supportAreaNeeded)}</li>
          <li><strong>Goals (next 6 months):</strong> ${fallback(input.businessGoalsNextSixMonths)}</li>
          <li><strong>Preferred contact method:</strong> ${escapeHtml(input.preferredContactMethod)}</li>
          <li><strong>Preferred contact day:</strong> ${fallback(input.preferredContactDay)}</li>
          <li><strong>Preferred contact time:</strong> ${fallback(input.preferredContactTime)}</li>
        </ul>
        <p>If you need to update any detail, you can reply to this email.</p>
        <p style="margin-top:20px;">Best regards,<br />Oreva<br />DXI Marketing</p>
      </div>
    `,
  };
}

export type PaymentDetailsInput = {
  firstName: string;
  /** The standard membership fee, already formatted. */
  feeLabel: string;
  bankDetails: BankDetails;
  paymentReference: string;
  paymentWindowLabel: string;
  /** Set when a referral code discounted this applicant's membership. */
  referral?: {
    code: string;
    /** Naira taken off, already formatted. */
    discountLabel: string;
    /** What they actually owe, already formatted. */
    payableLabel: string;
    /** True when the discount covers the fee in full. */
    fullyCovered: boolean;
  };
};

/**
 * Sent by hand from the dashboard, only after a profile is approved.
 *
 * A referral code that covers the fee in full produces a different email, not
 * a variation of this one: sending bank details for an amount of zero invites
 * someone to pay anyway, and asking for proof of a transfer that should never
 * happen is exactly the confusion a gifted place is supposed to avoid.
 */
export function buildPaymentDetailsEmail(input: PaymentDetailsInput): BuiltEmail {
  const { bankDetails: bank, referral } = input;
  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 12px;"><strong>${escapeHtml(label)}</strong></td><td style="padding:8px 12px;">${escapeHtml(value)}</td></tr>`;

  const signOff = `<p style="margin-top:20px;">Best regards,<br />Oreva<br />DXI Marketing</p>`;

  if (referral?.fullyCovered) {
    return {
      subject: "Your DXI Academy place is confirmed",
      html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.6;">
        <h2 style="margin:0 0 16px;color:#b91c1c;">You're in &mdash; and it's covered.</h2>
        <p>Hi ${escapeHtml(input.firstName)},</p>
        <p>
          We have reviewed your business profile and we would like to offer you a place in
          the DXI Academy.
        </p>
        <p>
          Your referral code <strong>${escapeHtml(referral.code)}</strong> covers your
          membership in full, so there is <strong>nothing for you to pay</strong>. Please do
          not send any money for this &mdash; if anyone asks you to, reply to this email
          first.
        </p>
        <p>
          Your membership is live: your community, your mentors, and your member rates. We
          will follow up shortly with your onboarding details.
        </p>
        <p>Reference for our records: <strong>${escapeHtml(input.paymentReference)}</strong>.</p>
        ${signOff}
      </div>
    `,
    };
  }

  const amountLabel = referral ? referral.payableLabel : input.feeLabel;

  const discountBlock = referral
    ? `<p style="margin:16px 0;padding:12px 16px;background:#f9fafb;border-left:3px solid #b91c1c;">
           Your referral code <strong>${escapeHtml(referral.code)}</strong> takes
           ${escapeHtml(referral.discountLabel)} off, so you pay
           <strong>${escapeHtml(referral.payableLabel)}</strong> instead of
           ${escapeHtml(input.feeLabel)}.
         </p>`
    : "";

  return {
    subject: "Your DXI Academy application has been approved",
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.6;">
        <h2 style="margin:0 0 16px;color:#b91c1c;">You're approved.</h2>
        <p>Hi ${escapeHtml(input.firstName)},</p>
        <p>
          We have reviewed your business profile and we would like to offer you a place in
          the DXI Academy. Membership is ${escapeHtml(input.feeLabel)} for the year.
        </p>
        ${discountBlock}
        <p>
          We are currently accepting payment by direct bank transfer only. Please send
          ${escapeHtml(amountLabel)} to:
        </p>
        <table style="border-collapse:collapse;margin:16px 0;background:#f9fafb;">
          ${row("Bank", bank.bankName)}
          ${row("Account name", bank.accountName)}
          ${row("Account number", bank.accountNumber)}
          ${row("Amount", amountLabel)}
          ${row("Reference", input.paymentReference)}
        </table>
        <p>
          Please use <strong>${escapeHtml(input.paymentReference)}</strong> as the transfer
          narration so we can match your payment, and reply to this email with your proof
          of payment. Your place is held for ${escapeHtml(input.paymentWindowLabel)}.
        </p>
        <p>
          Once we confirm the transfer, your membership goes live: your community, your
          mentors, and your member rates.
        </p>
        <p style="margin-top:12px;color:#6b7280;font-size:13px;">
          We will never ask you to send money to a personal account or to any details other
          than those above. If anything looks off, reply to this email before paying.
        </p>
        ${signOff}
      </div>
    `,
  };
}

export type RejectionInput = {
  firstName: string;
  /** Optional reviewer note. Blank sends the standard copy alone. */
  note?: string;
};

/**
 * Sent by hand from the dashboard when a profile is not accepted.
 *
 * The baseline copy is fixed so every applicant gets the same considerate
 * message; the optional note is appended when a reviewer wants to explain a
 * specific decision.
 */
export function buildRejectionEmail(input: RejectionInput): BuiltEmail {
  const note = input.note?.trim();

  const noteBlock = note
    ? `<div style="margin:16px 0;padding:14px 16px;background:#f9fafb;border-left:3px solid #b91c1c;">
             <p style="margin:0;white-space:pre-wrap;">${escapeHtml(note)}</p>
           </div>`
    : "";

  return {
    subject: "An update on your DXI Academy application",
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.6;">
        <h2 style="margin:0 0 16px;color:#111827;">An update on your application</h2>
        <p>Hi ${escapeHtml(input.firstName)},</p>
        <p>
          Thank you for taking the time to complete your business profile, and for telling
          us about what you are building. We have reviewed it carefully.
        </p>
        <p>
          On this occasion we are not able to offer you a place in the DXI Academy. This is
          not a judgement on you or your business &mdash; we take on a limited number of
          members at a time, and we only say yes where we are confident the Academy is the
          right fit for where a business is right now.
        </p>
        ${noteBlock}
        <p>
          You are welcome to apply again. If your business changes shape, grows, or your
          needs shift, submit a new profile and we will review it fresh.
        </p>
        <p>
          In the meantime you can still follow our work and reach us on any of our channels
          &mdash; and if you have questions about this decision, just reply to this email.
        </p>
        <p style="margin-top:20px;">We wish you every success,<br />Oreva<br />DXI Marketing</p>
      </div>
    `,
  };
}
