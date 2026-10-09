import { NextRequest, NextResponse } from "next/server";
import { getSurvey } from "@/content/surveys";
import {
  isResponseId,
  isValidEmail,
  normalizeEmail,
  sanitizeAnswers,
  surveyResumePath,
  type Survey,
  type SurveyResponse,
} from "@/lib/surveys";
import {
  findSurveyResponseByEmail,
  getSurveyResponse,
  markSurveyLinkSent,
  saveSurveyResponse,
} from "@/lib/firebase/surveys";
import {
  SURVEYS_FROM_NAME,
  buildSurveyLinkEmail,
  buildSurveyReceivedEmail,
} from "@/lib/emails/surveys";
import { siteOrigin } from "@/lib/links";
import { getZeptoConfig, sendZeptoEmail } from "@/lib/zeptomail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ slug: string }> };

/** A full set of answers is a few kilobytes. Anything near this is not one. */
const MAX_BODY_CHARS = 100_000;

/** How long before the same address can be sent its link again. */
const RESEND_INTERVAL_MS = 2 * 60 * 1000;

type SavePayload = {
  id?: unknown;
  email?: unknown;
  area?: unknown;
  answers?: unknown;
  status?: unknown;
};

/**
 * Emails a respondent the link to their own answers. Returns whether it went.
 *
 * Never throws: answers that saved must not then be reported as failed because
 * a courtesy email could not be sent.
 */
async function sendLinkEmail(
  survey: Survey,
  response: SurveyResponse,
  /** The site's public address. See where it is resolved in POST. */
  origin: string,
  kind: "link" | "received"
) {
  const { token, fromAddress } = getZeptoConfig();

  if (!token || !fromAddress) {
    console.error("Survey email configuration missing — no email sent.");
    return false;
  }

  const facts = {
    client: survey.client,
    surveyName: survey.name,
    resumeUrl: `${origin}${surveyResumePath(survey.slug, response.id)}`,
  };
  const email = kind === "link" ? buildSurveyLinkEmail(facts) : buildSurveyReceivedEmail(facts);

  try {
    await sendZeptoEmail(
      {
        from: { address: fromAddress, name: SURVEYS_FROM_NAME },
        to: [{ email_address: { address: response.email } }],
        subject: email.subject,
        htmlbody: email.html,
      },
      token
    );
    await markSurveyLinkSent(survey.slug, response.id);
    return true;
  } catch (error) {
    console.error(`Failed to send "${email.subject}" to ${response.email}:`, error);
    return false;
  }
}

/**
 * Reopens a response from its private link.
 *
 * The id is the whole credential, which is why it is only ever delivered to
 * the respondent's own inbox.
 */
export async function GET(request: NextRequest, { params }: Context) {
  const { slug } = await params;
  const survey = getSurvey(slug);
  const id = request.nextUrl.searchParams.get("id");

  if (!survey || !isResponseId(id)) {
    return NextResponse.json({ error: "That link is not valid." }, { status: 404 });
  }

  try {
    const response = await getSurveyResponse(slug, id);

    if (!response) {
      return NextResponse.json({ error: "That link is not valid." }, { status: 404 });
    }

    return NextResponse.json({
      email: response.email,
      area: response.area,
      answers: response.answers,
      status: response.status,
      submittedAt: response.submittedAt,
    });
  } catch (error) {
    console.error(`Failed to load a ${slug} response:`, error);
    return NextResponse.json({ error: "Could not load your answers." }, { status: 500 });
  }
}

/** Saves a draft or a submission. The form calls this as people move through it. */
export async function POST(request: NextRequest, { params }: Context) {
  const { slug } = await params;
  const survey = getSurvey(slug);

  if (!survey) {
    return NextResponse.json({ error: "That questionnaire does not exist." }, { status: 404 });
  }

  if (!survey.open) {
    return NextResponse.json(
      { error: "This questionnaire has closed and is no longer taking answers." },
      { status: 403 }
    );
  }

  try {
    // Read as text rather than JSON: a save on page close arrives through
    // sendBeacon, which does not label its body as JSON.
    const text = await request.text();

    if (text.length > MAX_BODY_CHARS) {
      return NextResponse.json({ error: "That is too much to save." }, { status: 413 });
    }

    const payload = JSON.parse(text) as SavePayload;
    const email = normalizeEmail(payload.email);
    const area = typeof payload.area === "string" ? payload.area : "";

    if (!isResponseId(payload.id)) {
      return NextResponse.json({ error: "This page needs reloading." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!survey.areas.some((choice) => choice[0] === area)) {
      return NextResponse.json({ error: "Choose your area." }, { status: 400 });
    }

    // Always the site's public address, never the request's. Behind App
    // Hosting the request's origin is the container's internal address, and on
    // a developer's machine it is localhost — and an email leaves the machine
    // either way, so neither is a link its reader can open. A link carrying
    // somebody's private id should not be built from request headers anyway.
    const origin = siteOrigin();
    const existing = await getSurveyResponse(slug, payload.id);

    if (!existing) {
      // Somebody starting again on a second device. Their answers are not
      // handed to whoever typed the address — the link goes to the inbox.
      const earlier = await findSurveyResponseByEmail(slug, email);

      if (earlier) {
        const lastSent = earlier.linkSentAt ? Date.parse(earlier.linkSentAt) : 0;
        const sent =
          Date.now() - lastSent < RESEND_INTERVAL_MS ||
          (await sendLinkEmail(survey, earlier, origin, "link"));

        return NextResponse.json(
          {
            code: "already_started",
            error: sent
              ? `A questionnaire has already been started with ${email}. We have emailed that address a link to continue it.`
              : `A questionnaire has already been started with ${email}, but we could not email its link just now. Please try again in a few minutes, or continue on the device you started on.`,
          },
          { status: 409 }
        );
      }
    }

    const { response, created, justSubmitted } = await saveSurveyResponse(slug, {
      id: payload.id,
      email,
      area,
      answers: sanitizeAnswers(survey, payload.answers),
      status: payload.status === "submitted" ? "submitted" : "draft",
    });

    let emailed = false;

    if (justSubmitted) {
      emailed = await sendLinkEmail(survey, response, origin, "received");
    } else if (created) {
      emailed = await sendLinkEmail(survey, response, origin, "link");
    }

    return NextResponse.json({
      status: response.status,
      submittedAt: response.submittedAt,
      email: response.email,
      emailed,
    });
  } catch (error) {
    console.error(`Failed to save a ${slug} response:`, error);
    return NextResponse.json({ error: "Could not save your answers." }, { status: 500 });
  }
}
