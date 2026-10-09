import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSurvey } from "@/content/surveys";
import { isResponseId } from "@/lib/surveys";
import {
  deleteSurveyResponse,
  getSurveyResponse,
  listSurveyResponses,
} from "@/lib/firebase/surveys";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ slug: string }> };

/** Every response to one questionnaire, drafts included. */
export async function GET(request: NextRequest, { params }: Context) {
  const { response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { slug } = await params;

  if (!getSurvey(slug)) {
    return NextResponse.json({ error: "That questionnaire does not exist." }, { status: 404 });
  }

  try {
    return NextResponse.json({ responses: await listSurveyResponses(slug) });
  } catch (error) {
    console.error(`Failed to list ${slug} responses:`, error);
    return NextResponse.json({ error: "Could not load the responses." }, { status: 500 });
  }
}

/**
 * Removes one response for good. There for the test entries made while
 * checking the form — there is no undo, so the dashboard asks first.
 */
export async function DELETE(request: NextRequest, { params }: Context) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { slug } = await params;
  const id = request.nextUrl.searchParams.get("id");

  if (!getSurvey(slug) || !isResponseId(id)) {
    return NextResponse.json({ error: "That response does not exist." }, { status: 404 });
  }

  try {
    const existing = await getSurveyResponse(slug, id);

    if (!existing) {
      return NextResponse.json({ error: "That response does not exist." }, { status: 404 });
    }

    await deleteSurveyResponse(slug, id);
    console.info(`${session.email} deleted the ${slug} response from ${existing.email}`);

    return NextResponse.json({ message: `Deleted the response from ${existing.email}.` });
  } catch (error) {
    console.error(`Failed to delete a ${slug} response:`, error);
    return NextResponse.json({ error: "Could not delete the response." }, { status: 500 });
  }
}
