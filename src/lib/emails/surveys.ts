import { escapeHtml, type BuiltEmail } from "./academy";

/**
 * Respondent-facing email for client questionnaires.
 *
 * Same contract as the other templates: no side effects, every value passed
 * in. Both emails exist to carry one thing — the private link back to the
 * respondent's own answers — so each is written to make sense on its own.
 */

export const SURVEYS_FROM_NAME = "DXI Marketing";

export type SurveyEmailFacts = {
  /** e.g. "CFG Africa". */
  client: string;
  /** e.g. "Brand & Communications 2030". */
  surveyName: string;
  resumeUrl: string;
};

const wrap = (heading: string, body: string) => `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.6;">
        <h2 style="margin:0 0 16px;color:#0f2347;">${heading}</h2>
        ${body}
        <p style="margin-top:20px;">Thank you,<br />DXI Marketing</p>
      </div>
    `;

const linkBlock = (url: string, label: string) => `
        <p style="margin:20px 0;">
          <a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 20px;background:#0f2347;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">${escapeHtml(label)}</a>
        </p>
        <p style="color:#6b7280;font-size:13px;">
          This link is yours alone and opens your answers without a password, so please do not
          forward it. If the button does not work, copy this address into your browser:<br />
          ${escapeHtml(url)}
        </p>
`;

/** Sent once, when somebody starts — and again if they start over elsewhere. */
export function buildSurveyLinkEmail(facts: SurveyEmailFacts): BuiltEmail {
  return {
    subject: `Your link to the ${facts.client} questionnaire — ${facts.surveyName}`,
    html: wrap(
      "Your link to continue",
      `
        <p>
          You have started the ${escapeHtml(facts.client)} ${escapeHtml(facts.surveyName)}
          questionnaire. Your answers save as you go, and the link below brings you back to them on
          any device — to finish later, or to change an answer after you have submitted.
        </p>
        ${linkBlock(facts.resumeUrl, "Continue the questionnaire")}
      `
    ),
  };
}

export function buildSurveyReceivedEmail(facts: SurveyEmailFacts): BuiltEmail {
  return {
    subject: `We have your answers — ${facts.client} ${facts.surveyName}`,
    html: wrap(
      "Thank you. Your answers are in.",
      `
        <p>
          We have received your answers to the ${escapeHtml(facts.client)}
          ${escapeHtml(facts.surveyName)} questionnaire. We will combine them with the rest of the
          team's into one summary for the session.
        </p>
        <p>If you want to change anything before the session, use the link below.</p>
        ${linkBlock(facts.resumeUrl, "Review or update my answers")}
      `
    ),
  };
}
