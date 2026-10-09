import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSurvey } from "@/content/surveys";
import { countAnswered, flattenAnswer, labelOf, surveyQuestions } from "@/lib/surveys";
import { listSurveyResponses } from "@/lib/firebase/surveys";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ slug: string }> };

/** Quoted unconditionally — free-text answers are full of commas. */
function csvField(value: unknown) {
  if (value === null || value === undefined) {
    return '""';
  }

  return `"${String(value).replace(/"/g, '""')}"`;
}

/**
 * Every response as a spreadsheet, one row per person.
 *
 * The summary on screen shows the team; this is for reading one executive's
 * answers end to end, and it is the only place their email sits beside them.
 */
export async function GET(request: NextRequest, { params }: Context) {
  const { response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { slug } = await params;
  const survey = getSurvey(slug);

  if (!survey) {
    return NextResponse.json({ error: "That questionnaire does not exist." }, { status: 404 });
  }

  try {
    const responses = await listSurveyResponses(slug);
    const questions = surveyQuestions(survey);

    const header = [
      "Email",
      "Area",
      "Status",
      "Answered",
      "Started",
      "Last updated",
      "Submitted",
      ...questions.flatMap((question) =>
        flattenAnswer(question, undefined).map(([heading]) => heading)
      ),
    ];

    const rows = [
      header.map(csvField).join(","),
      ...responses.map((response) =>
        [
          response.email,
          labelOf(survey.areas, response.area),
          response.status === "submitted" ? "Submitted" : "In progress",
          `${countAnswered(survey, response.answers)} of ${questions.length}`,
          response.createdAt,
          response.updatedAt,
          response.submittedAt,
          ...questions.flatMap((question) =>
            flattenAnswer(question, response.answers?.[question.id]).map(([, value]) => value)
          ),
        ]
          .map(csvField)
          .join(",")
      ),
    ];

    // Without the byte order mark Excel reads UTF-8 as the system codepage.
    const body = `﻿${rows.join("\r\n")}\r\n`;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}-responses.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(`Failed to export ${slug} responses:`, error);
    return NextResponse.json({ error: "Could not build the export." }, { status: 500 });
  }
}
