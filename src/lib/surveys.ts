/**
 * Client questionnaires: what a survey is, and what a valid answer to each
 * kind of question looks like.
 *
 * Import-free on purpose. The public form, the save route, the admin summary
 * and the export all read the same definition, and `sanitizeAnswer` is the one
 * place that decides what shape an answer has — so the summary can trust what
 * the route stored, and the form can trust what it finds in localStorage.
 */

/** `[value, label, detail?]`. The value is what gets stored. */
export type Choice = readonly [value: string, label: string, detail?: string];

type QuestionBase = {
  /** Storage key. Never reuse or renumber once responses exist. */
  id: string;
  /** The number respondents see. */
  n: number;
  prompt: string;
  help?: string;
};

export type SurveyQuestion =
  | (QuestionBase & { type: "words3" })
  | (QuestionBase & { type: "three"; fieldLabel: string })
  | (QuestionBase & { type: "text" })
  | (QuestionBase & {
      type: "fields";
      fields: readonly (readonly [key: string, label: string, kind: "short" | "long"])[];
    })
  | (QuestionBase & { type: "rating"; items: readonly Choice[]; lo: string; hi: string })
  | (QuestionBase & { type: "matrix"; rows: readonly Choice[]; cols: readonly Choice[] })
  | (QuestionBase & {
      type: "single";
      options: readonly Choice[];
      /** Shows a free-text box when the option valued `other` is picked. */
      other?: boolean;
      /** Label for an optional one-line reason under the options. */
      comment?: string;
      columns?: 2;
    })
  | (QuestionBase & { type: "multi"; options: readonly Choice[]; max?: number; columns?: 2 })
  | (QuestionBase & { type: "rank"; items: readonly Choice[] })
  | (QuestionBase & { type: "slider"; lo: string; hi: string });

export type SurveySection = {
  key: string;
  title: string;
  minutes: number;
  lede: string;
  questions: readonly SurveyQuestion[];
};

export type Survey = {
  slug: string;
  /** Who it is for, as it appears in admin and in emails. */
  client: string;
  name: string;
  eyebrow: string;
  title: string;
  /** Printed after the title in the accent colour. */
  titleAccent: string;
  headline: string;
  intro: string;
  minutes: number;
  footer: string;
  /** The respondent's job function. */
  areas: readonly Choice[];
  /** Closed surveys still load, but accept no new answers. */
  open: boolean;
  sections: readonly SurveySection[];
};

export type SingleAnswer = { v: string; other?: string; c?: string };
export type SliderAnswer = { today: number; future: number };

export type SurveyAnswer =
  | string
  | string[]
  | Record<string, string>
  | Record<string, number>
  | SingleAnswer
  | SliderAnswer;

export type SurveyAnswers = Record<string, SurveyAnswer>;

export type SurveyStatus = "draft" | "submitted";

export type SurveyResponse = {
  /** Also the secret in the respondent's link — never show it to anyone else. */
  id: string;
  email: string;
  area: string;
  answers: SurveyAnswers;
  status: SurveyStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  linkSentAt: string | null;
};

export const SURVEYS_PATH = "/surveys";

/**
 * Survey pages belong to the client being surveyed, so they carry none of the
 * site's own chrome: no nav, footer, chat bubble, analytics or cookie banner.
 */
export function isSurveyPath(pathname: string | null | undefined) {
  return Boolean(pathname && (pathname === SURVEYS_PATH || pathname.startsWith(`${SURVEYS_PATH}/`)));
}

export function surveyPath(slug: string) {
  return `${SURVEYS_PATH}/${slug}`;
}

/** The private link that reopens one person's answers. */
export function surveyResumePath(slug: string, responseId: string) {
  return `${surveyPath(slug)}?r=${responseId}`;
}

export function surveyQuestions(survey: Survey): SurveyQuestion[] {
  return survey.sections.flatMap((section) => section.questions);
}

const RESPONSE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function isResponseId(value: unknown): value is string {
  return typeof value === "string" && RESPONSE_ID.test(value);
}

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase().slice(0, 254) : "";
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function labelOf(choices: readonly Choice[], value: string | undefined) {
  return choices.find((choice) => choice[0] === value)?.[1] ?? "";
}

const WORD_MAX = 40;
const SHORT_MAX = 160;
const COMMENT_MAX = 500;
const LONG_MAX = 2000;

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function intBetween(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
    ? value
    : null;
}

/**
 * Reduces whatever arrived to a well-formed answer, or `undefined` if nothing
 * usable is left. Anything the question did not ask for is dropped.
 */
export function sanitizeAnswer(question: SurveyQuestion, raw: unknown): SurveyAnswer | undefined {
  switch (question.type) {
    case "words3":
    case "three": {
      if (!Array.isArray(raw)) {
        return undefined;
      }

      const max = question.type === "words3" ? WORD_MAX : SHORT_MAX;
      const entries = [0, 1, 2].map((index) => clip(raw[index], max));
      return entries.some(Boolean) ? entries : undefined;
    }

    case "text":
      return clip(raw, LONG_MAX) || undefined;

    case "fields": {
      if (!isRecord(raw)) {
        return undefined;
      }

      const entries: Record<string, string> = {};

      for (const [key, , kind] of question.fields) {
        const text = clip(raw[key], kind === "long" ? LONG_MAX : SHORT_MAX);

        if (text) {
          entries[key] = text;
        }
      }

      return Object.keys(entries).length ? entries : undefined;
    }

    case "rating": {
      if (!isRecord(raw)) {
        return undefined;
      }

      const scores: Record<string, number> = {};

      for (const [key] of question.items) {
        const score = intBetween(raw[key], 1, 5);

        if (score !== null) {
          scores[key] = score;
        }
      }

      return Object.keys(scores).length ? scores : undefined;
    }

    case "matrix": {
      if (!isRecord(raw)) {
        return undefined;
      }

      const picks: Record<string, string> = {};

      for (const [key] of question.rows) {
        const pick = raw[key];

        if (typeof pick === "string" && question.cols.some((col) => col[0] === pick)) {
          picks[key] = pick;
        }
      }

      return Object.keys(picks).length ? picks : undefined;
    }

    case "single": {
      if (!isRecord(raw)) {
        return undefined;
      }

      const v = question.options.some((option) => option[0] === raw.v) ? (raw.v as string) : "";
      const other = question.other && v === "other" ? clip(raw.other, SHORT_MAX) : "";
      const c = question.comment ? clip(raw.c, COMMENT_MAX) : "";

      // A reason typed before an option is picked is kept, so it is still
      // there when they come back to choose.
      if (!v && !c) {
        return undefined;
      }

      return { v, ...(other ? { other } : {}), ...(c ? { c } : {}) };
    }

    case "multi": {
      if (!Array.isArray(raw)) {
        return undefined;
      }

      const picks = question.options
        .map((option) => option[0])
        .filter((value) => raw.includes(value))
        .slice(0, question.max ?? question.options.length);

      return picks.length ? picks : undefined;
    }

    case "rank": {
      if (!Array.isArray(raw)) {
        return undefined;
      }

      // May be part-way through: items are ranked one tap at a time, and a
      // half-finished ranking should survive a reload. `isAnswered` is what
      // insists on the full set.
      const order = question.items
        .map((item) => item[0])
        .filter((key) => raw.includes(key))
        .sort((a, b) => raw.indexOf(a) - raw.indexOf(b));

      return order.length ? order : undefined;
    }

    case "slider": {
      if (!isRecord(raw)) {
        return undefined;
      }

      const today = intBetween(raw.today, 0, 10);
      const future = intBetween(raw.future, 0, 10);
      return today === null || future === null ? undefined : { today, future };
    }
  }
}

export function sanitizeAnswers(survey: Survey, raw: unknown): SurveyAnswers {
  const answers: SurveyAnswers = {};

  if (!isRecord(raw)) {
    return answers;
  }

  for (const question of surveyQuestions(survey)) {
    const answer = sanitizeAnswer(question, raw[question.id]);

    if (answer !== undefined) {
      answers[question.id] = answer;
    }
  }

  return answers;
}

export function isAnswered(question: SurveyQuestion, raw: unknown) {
  const answer = sanitizeAnswer(question, raw);

  if (answer === undefined) {
    return false;
  }

  if (question.type === "single") {
    return Boolean((answer as SingleAnswer).v);
  }

  // A partial order cannot be averaged with the others.
  if (question.type === "rank") {
    return (answer as string[]).length === question.items.length;
  }

  return true;
}

export function countAnswered(survey: Survey, answers: SurveyAnswers) {
  return surveyQuestions(survey).filter((question) => isAnswered(question, answers[question.id]))
    .length;
}

/**
 * One answer as spreadsheet cells, `[heading, value]`.
 *
 * The headings depend only on the question, never on the answer, so every
 * response produces the same columns in the same order.
 */
export function flattenAnswer(question: SurveyQuestion, raw: unknown): [string, string][] {
  const answer = sanitizeAnswer(question, raw);
  const q = `Q${question.n}`;

  switch (question.type) {
    case "words3":
    case "three": {
      const entries = (answer as string[] | undefined) ?? [];
      const noun = question.type === "words3" ? "word" : "must-have";
      return [0, 1, 2].map((index) => [`${q} ${noun} ${index + 1}`, entries[index] ?? ""]);
    }

    case "text":
      return [[`${q} ${question.prompt}`, (answer as string | undefined) ?? ""]];

    case "fields": {
      const entries = (answer as Record<string, string> | undefined) ?? {};
      return question.fields.map(([key, label]) => [`${q} ${label}`, entries[key] ?? ""]);
    }

    case "rating": {
      const scores = (answer as Record<string, number> | undefined) ?? {};
      return question.items.map(([key, label]) => [
        `${q} ${label} (1-5)`,
        scores[key] === undefined ? "" : String(scores[key]),
      ]);
    }

    case "matrix": {
      const picks = (answer as Record<string, string> | undefined) ?? {};
      return question.rows.map(([key, label]) => [
        `${q} ${label}`,
        labelOf(question.cols, picks[key]),
      ]);
    }

    case "single": {
      const pick = answer as SingleAnswer | undefined;
      const cells: [string, string][] = [
        [`${q} ${question.prompt}`, pick?.other || labelOf(question.options, pick?.v)],
      ];

      if (question.comment) {
        cells.push([`${q} why`, pick?.c ?? ""]);
      }

      return cells;
    }

    case "multi": {
      const picks = (answer as string[] | undefined) ?? [];
      return [
        [`${q} ${question.prompt}`, picks.map((v) => labelOf(question.options, v)).join("; ")],
      ];
    }

    case "rank": {
      const order = (answer as string[] | undefined) ?? [];
      return [
        [
          `${q} ${question.prompt}`,
          order.map((key, index) => `${index + 1}. ${labelOf(question.items, key)}`).join("; "),
        ],
      ];
    }

    case "slider": {
      const marks = answer as SliderAnswer | undefined;
      const scale = `${question.lo} 0 to ${question.hi} 10`;
      return [
        [`${q} today (${scale})`, marks ? String(marks.today) : ""],
        [`${q} by 2030 (${scale})`, marks ? String(marks.future) : ""],
      ];
    }
  }
}
