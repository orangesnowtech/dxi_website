import { firestore } from "@/lib/firebase/admin";
import type { SurveyAnswers, SurveyResponse, SurveyStatus } from "@/lib/surveys";

/**
 * Storage for questionnaire responses.
 *
 * The response id is the document id and doubles as the respondent's key: it
 * is generated in their browser, emailed to them as a link, and is the only
 * thing that can reopen their answers. Nothing here hands one out to anybody
 * but the admin dashboard.
 */

export const SURVEYS_COLLECTION = "surveys";

const responses = (slug: string) =>
  firestore.collection(SURVEYS_COLLECTION).doc(slug).collection("responses");

function readResponse(snapshot: FirebaseFirestore.DocumentSnapshot): SurveyResponse {
  return { ...(snapshot.data() as Omit<SurveyResponse, "id">), id: snapshot.id };
}

export async function getSurveyResponse(slug: string, id: string): Promise<SurveyResponse | null> {
  const snapshot = await responses(slug).doc(id).get();
  return snapshot.exists ? readResponse(snapshot) : null;
}

export async function findSurveyResponseByEmail(
  slug: string,
  email: string
): Promise<SurveyResponse | null> {
  const snapshot = await responses(slug).where("email", "==", email).limit(1).get();
  return snapshot.empty ? null : readResponse(snapshot.docs[0]);
}

export async function listSurveyResponses(slug: string): Promise<SurveyResponse[]> {
  const snapshot = await responses(slug).orderBy("updatedAt", "desc").get();
  return snapshot.docs.map(readResponse);
}

export type SaveSurveyResponseInput = {
  id: string;
  email: string;
  area: string;
  answers: SurveyAnswers;
  status: SurveyStatus;
};

/**
 * Creates the response or replaces its answers.
 *
 * In a transaction so that the two things worth emailing about — the first
 * save and the first submit — are each reported exactly once, even when a
 * page-close save and a button press land together.
 */
export async function saveSurveyResponse(
  slug: string,
  input: SaveSurveyResponseInput
): Promise<{ response: SurveyResponse; created: boolean; justSubmitted: boolean }> {
  const ref = responses(slug).doc(input.id);

  return firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const existing = snapshot.exists ? readResponse(snapshot) : null;
    const now = new Date().toISOString();

    // Submitted stays submitted: a later autosave is an edit to a submitted
    // response, not a retraction of it.
    const status: SurveyStatus =
      existing?.status === "submitted" || input.status === "submitted" ? "submitted" : "draft";

    const record: Omit<SurveyResponse, "id"> = {
      // The address the link was sent to is the one that stays on record.
      email: existing?.email ?? input.email,
      area: input.area,
      answers: input.answers,
      status,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      submittedAt: existing?.submittedAt ?? (status === "submitted" ? now : null),
      linkSentAt: existing?.linkSentAt ?? null,
    };

    transaction.set(ref, record);

    return {
      response: { ...record, id: input.id },
      created: !existing,
      justSubmitted: status === "submitted" && existing?.status !== "submitted",
    };
  });
}

export async function markSurveyLinkSent(slug: string, id: string) {
  await responses(slug).doc(id).update({ linkSentAt: new Date().toISOString() });
}

export async function deleteSurveyResponse(slug: string, id: string) {
  await responses(slug).doc(id).delete();
}
