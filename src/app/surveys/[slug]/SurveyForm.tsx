"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  countAnswered,
  isAnswered,
  isResponseId,
  isValidEmail,
  normalizeEmail,
  sanitizeAnswers,
  surveyQuestions,
  type SingleAnswer,
  type SliderAnswer,
  type Survey,
  type SurveyAnswer,
  type SurveyAnswers,
  type SurveyQuestion,
  type SurveyStatus,
} from "@/lib/surveys";
import styles from "./survey.module.css";

/**
 * What this browser holds. Mirrored to localStorage on every keystroke, so a
 * closed tab or a dropped connection costs nothing that was typed.
 */
type Draft = {
  id: string;
  email: string;
  area: string;
  answers: SurveyAnswers;
  status: SurveyStatus;
  submittedAt: string | null;
  /** The server has this response, so its link has been emailed. */
  started: boolean;
  /** There are edits the server has not seen. */
  dirty: boolean;
};

type SaveTone = "" | "ok" | "busy" | "off";
type SaveResult = { ok: boolean; code?: string; error?: string; emailed?: boolean };

type QuestionOf<T extends SurveyQuestion["type"]> = Extract<SurveyQuestion, { type: T }>;
type BodyProps<T extends SurveyQuestion["type"]> = {
  question: QuestionOf<T>;
  value: unknown;
  onChange: (value: SurveyAnswer) => void;
};

function newResponseId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Older Safari has getRandomValues but not randomUUID.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function freshDraft(): Draft {
  return {
    id: newResponseId(),
    email: "",
    area: "",
    answers: {},
    status: "draft",
    submittedAt: null,
    started: false,
    dirty: false,
  };
}

function cx(...names: (string | false | null | undefined)[]) {
  return names.filter(Boolean).join(" ");
}

/* ---------- Question bodies ---------- */

function WordsBody({ question, value, onChange }: BodyProps<"words3" | "three">) {
  const entries = Array.isArray(value) ? (value as string[]) : [];
  const set = (index: number, text: string) =>
    onChange([0, 1, 2].map((i) => (i === index ? text : entries[i] ?? "")));

  if (question.type === "words3") {
    return (
      <div className={styles.words}>
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            type="text"
            aria-label={`Word ${i + 1}`}
            placeholder={`Word ${i + 1}`}
            maxLength={40}
            value={entries[i] ?? ""}
            onChange={(e) => set(i, e.target.value)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      {[0, 1, 2].map((i) => (
        <div key={i} className={styles.field}>
          <label htmlFor={`${question.id}-${i}`}>
            {question.fieldLabel} {i + 1}
          </label>
          <input
            type="text"
            id={`${question.id}-${i}`}
            maxLength={160}
            value={entries[i] ?? ""}
            onChange={(e) => set(i, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

function TextBody({ question, value, onChange }: BodyProps<"text">) {
  return (
    <textarea
      aria-labelledby={`h-${question.id}`}
      maxLength={2000}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function FieldsBody({ question, value, onChange }: BodyProps<"fields">) {
  const entries = (value as Record<string, string> | undefined) ?? {};

  return (
    <div className={styles.stack}>
      {question.fields.map(([key, label, kind]) => {
        const id = `${question.id}-${key}`;
        const set = (text: string) => onChange({ ...entries, [key]: text });

        return (
          <div key={key} className={styles.field}>
            <label htmlFor={id}>{label}</label>
            {kind === "long" ? (
              <textarea
                id={id}
                maxLength={2000}
                value={entries[key] ?? ""}
                onChange={(e) => set(e.target.value)}
              />
            ) : (
              <input
                type="text"
                id={id}
                maxLength={160}
                value={entries[key] ?? ""}
                onChange={(e) => set(e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function RatingBody({ question, value, onChange }: BodyProps<"rating">) {
  const scores = (value as Record<string, number> | undefined) ?? {};

  return (
    <div className={styles.rate}>
      <span />
      <div className={styles.scaleLegend}>
        <span>1 · {question.lo}</span>
        <span>{question.hi} · 5</span>
      </div>
      {question.items.map(([key, label]) => (
        // display: contents — the label and the scale sit in the parent grid.
        <div key={key} style={{ display: "contents" }}>
          <span>{label}</span>
          <div className={styles.scale} role="group" aria-label={label}>
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                aria-pressed={scores[key] === score}
                aria-label={`${label}: ${score}`}
                onClick={() => onChange({ ...scores, [key]: score })}
              >
                {score}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MatrixBody({ question, value, onChange }: BodyProps<"matrix">) {
  const picks = (value as Record<string, string> | undefined) ?? {};

  return (
    <>
      {/* Six columns do not fit a phone, and a table that scrolls sideways
          hides most of its options. Below the breakpoint each group gets a
          menu instead; both are driven by the same answer. */}
      <div className={styles.matrixList}>
        {question.rows.map(([rowKey, rowLabel]) => (
          <div key={rowKey} className={styles.field}>
            <label htmlFor={`${question.id}-${rowKey}`}>{rowLabel}</label>
            <select
              id={`${question.id}-${rowKey}`}
              value={picks[rowKey] ?? ""}
              onChange={(e) => e.target.value && onChange({ ...picks, [rowKey]: e.target.value })}
            >
              <option value="">Choose one</option>
              {question.cols.map(([colKey, colLabel]) => (
                <option key={colKey} value={colKey}>
                  {colLabel}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className={styles.matrix}>
        <table>
          <thead>
            <tr>
              <th>Group</th>
              {question.cols.map(([key, label]) => (
                <th key={key} scope="col">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {question.rows.map(([rowKey, rowLabel]) => (
              <tr key={rowKey}>
                <td>{rowLabel}</td>
                {question.cols.map(([colKey, colLabel]) => (
                  <td key={colKey}>
                    <input
                      type="radio"
                      name={`${question.id}-${rowKey}`}
                      aria-label={`${rowLabel}: ${colLabel}`}
                      checked={picks[rowKey] === colKey}
                      onChange={() => onChange({ ...picks, [rowKey]: colKey })}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SingleBody({ question, value, onChange }: BodyProps<"single">) {
  const pick = (value as SingleAnswer | undefined) ?? { v: "" };

  return (
    <div className={styles.stack}>
      <div
        className={cx(styles.opts, question.columns === 2 && styles.two)}
        role="radiogroup"
        aria-labelledby={`h-${question.id}`}
      >
        {question.options.map(([key, label, detail]) => (
          <label key={key} className={styles.opt}>
            <input
              type="radio"
              name={question.id}
              checked={pick.v === key}
              onChange={() => onChange({ ...pick, v: key })}
            />
            <div>
              <b>{label}</b>
              {detail && <span>{detail}</span>}
            </div>
          </label>
        ))}
      </div>

      {question.other && pick.v === "other" && (
        <div className={styles.field}>
          <label htmlFor={`${question.id}-other`}>Please describe</label>
          <input
            type="text"
            id={`${question.id}-other`}
            maxLength={160}
            value={pick.other ?? ""}
            onChange={(e) => onChange({ ...pick, other: e.target.value })}
          />
        </div>
      )}

      {question.comment && (
        <div className={styles.field}>
          <label htmlFor={`${question.id}-c`}>{question.comment}</label>
          <textarea
            id={`${question.id}-c`}
            className={styles.oneLine}
            maxLength={500}
            value={pick.c ?? ""}
            onChange={(e) => onChange({ ...pick, c: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

function MultiBody({ question, value, onChange }: BodyProps<"multi">) {
  const picks = Array.isArray(value) ? (value as string[]) : [];
  const max = question.max ?? question.options.length;

  return (
    <div>
      <div className={styles.limit}>
        {question.max ? `Choose up to ${question.max}. ` : ""}
        {picks.length} selected.
      </div>
      <div className={cx(styles.opts, question.columns === 2 && styles.two)}>
        {question.options.map(([key, label]) => {
          const checked = picks.includes(key);

          return (
            <label key={key} className={styles.opt}>
              <input
                type="checkbox"
                checked={checked}
                disabled={!checked && picks.length >= max}
                onChange={(e) =>
                  onChange(e.target.checked ? [...picks, key] : picks.filter((v) => v !== key))
                }
              />
              <div>
                <b>{label}</b>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function RankBody({ question, value, onChange }: BodyProps<"rank">) {
  // Ranked by tapping in order rather than by dragging or nudging: on a phone
  // the whole row is the target, and five items take four taps.
  const ranked = Array.isArray(value) ? (value as string[]) : [];
  const labels = Object.fromEntries(question.items.map(([key, label]) => [key, label]));
  const unranked = question.items.map((item) => item[0]).filter((key) => !ranked.includes(key));

  const rank = (key: string) => {
    const next = [...ranked, key];
    const left = unranked.filter((other) => other !== key);

    // The last one has nowhere else to go.
    onChange(left.length === 1 ? [...next, left[0]] : next);
  };

  return (
    <div className={styles.stack} role="group" aria-labelledby={`h-${question.id}`}>
      <div className={styles.limit} aria-live="polite">
        {ranked.length === 0
          ? "Tap the most important one first."
          : unranked.length > 0
            ? "Now tap the next most important."
            : "Ranked. Tap any item to take it out and place it again."}
      </div>

      {ranked.length > 0 && (
        <ol className={styles.rank}>
          {ranked.map((key, index) => (
            <li key={key}>
              <button
                type="button"
                className={cx(styles.rankItem, styles.ranked)}
                aria-label={`${index + 1}: ${labels[key]}. Remove from the ranking`}
                onClick={() => onChange(ranked.filter((other) => other !== key))}
              >
                <span className={styles.pos}>{index + 1}</span>
                <span>{labels[key]}</span>
                <span className={styles.rankUndo} aria-hidden="true">
                  ✕
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}

      {unranked.length > 0 && (
        <ul className={styles.rank}>
          {unranked.map((key) => (
            <li key={key}>
              <button type="button" className={styles.rankItem} onClick={() => rank(key)}>
                <span className={styles.pos} aria-hidden="true">
                  –
                </span>
                <span>{labels[key]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {ranked.length > 0 && (
        <button type="button" className={styles.linkBtn} onClick={() => onChange([])}>
          Start this ranking again
        </button>
      )}
    </div>
  );
}

function SliderBody({ question, value, onChange }: BodyProps<"slider">) {
  const touched = Boolean(value);
  const marks = (value as SliderAnswer | undefined) ?? { today: 5, future: 5 };
  const rows = [
    ["today", "Today", styles.today],
    ["future", "By 2030", styles.future],
  ] as const;

  return (
    <div className={cx(styles.slider, !touched && styles.untouched)}>
      <div className={styles.poles}>
        <span>← {question.lo}</span>
        <span>{question.hi} →</span>
      </div>
      {rows.map(([key, label, tone]) => {
        const id = `${question.id}-${key}`;

        return (
          <div key={key} className={cx(styles.srow, tone)}>
            <label htmlFor={id}>{label}</label>
            <input
              type="range"
              id={id}
              min={0}
              max={10}
              step={1}
              value={marks[key]}
              aria-valuetext={`${label}: ${marks[key]} of 10`}
              onChange={(e) => onChange({ ...marks, [key]: Number(e.target.value) })}
            />
            <output htmlFor={id}>{marks[key]}</output>
          </div>
        );
      })}
    </div>
  );
}

function QuestionBody({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value: unknown;
  onChange: (value: SurveyAnswer) => void;
}) {
  switch (question.type) {
    case "words3":
    case "three":
      return <WordsBody question={question} value={value} onChange={onChange} />;
    case "text":
      return <TextBody question={question} value={value} onChange={onChange} />;
    case "fields":
      return <FieldsBody question={question} value={value} onChange={onChange} />;
    case "rating":
      return <RatingBody question={question} value={value} onChange={onChange} />;
    case "matrix":
      return <MatrixBody question={question} value={value} onChange={onChange} />;
    case "single":
      return <SingleBody question={question} value={value} onChange={onChange} />;
    case "multi":
      return <MultiBody question={question} value={value} onChange={onChange} />;
    case "rank":
      return <RankBody question={question} value={value} onChange={onChange} />;
    case "slider":
      return <SliderBody question={question} value={value} onChange={onChange} />;
  }
}

/* ---------- The form ---------- */

export default function SurveyForm({ survey }: { survey: Survey }) {
  const storageKey = `dxi-survey-${survey.slug}`;
  const endpoint = `/api/surveys/${survey.slug}/responses`;
  const questions = useMemo(() => surveyQuestions(survey), [survey]);

  // Step 0 is the intro, then one step per section, then the review.
  const steps = useMemo(
    () => ["Before you start", ...survey.sections.map((s) => s.title), "Review and submit"],
    [survey]
  );
  const reviewStep = steps.length - 1;

  const [draft, setDraft] = useState<Draft | null>(null);
  const draftRef = useRef<Draft | null>(null);
  const [step, setStep] = useState(0);
  const [thanks, setThanks] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saveState, setSaveState] = useState<{ tone: SaveTone; text: string }>({
    tone: "",
    text: "Draft kept in this browser",
  });
  const [notice, setNotice] = useState<{ tone: "good" | "warn"; text: string } | null>(null);
  const saveChain = useRef<Promise<unknown>>(Promise.resolve());
  const topRef = useRef<HTMLDivElement>(null);

  const commit = useCallback(
    (next: Draft) => {
      draftRef.current = next;
      setDraft(next);

      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Private windows can refuse storage. The form still works; it just
        // cannot survive a reload.
      }
    },
    [storageKey]
  );

  const edit = (patch: Partial<Draft>) => {
    if (draftRef.current) {
      commit({ ...draftRef.current, ...patch, dirty: true });
    }
  };

  /**
   * Opens with whichever copy of the answers is current: the response named in
   * an emailed link, otherwise this browser's own — refreshed from the server
   * unless the browser holds edits the server has not seen.
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      let local: Draft | null = null;

      try {
        const stored = JSON.parse(localStorage.getItem(storageKey) || "null");

        if (stored && isResponseId(stored.id)) {
          local = {
            ...freshDraft(),
            ...stored,
            answers: sanitizeAnswers(survey, stored.answers),
          };
        }
      } catch {
        // Unreadable storage is the same as none.
      }

      const linked = new URLSearchParams(window.location.search).get("r");
      const id = isResponseId(linked) ? linked : local?.started ? local.id : null;
      let opened: { tone: "good" | "warn"; text: string } | null = null;

      if (id && !(local && local.id === id && local.dirty)) {
        try {
          const response = await fetch(`${endpoint}?id=${id}`);

          if (response.ok) {
            const data = await response.json();
            local = {
              id,
              email: data.email,
              area: data.area,
              answers: sanitizeAnswers(survey, data.answers),
              status: data.status,
              submittedAt: data.submittedAt,
              started: true,
              dirty: false,
            };

            if (linked) {
              opened = { tone: "good", text: "Welcome back. Your saved answers are loaded." };
            }
          } else if (linked) {
            opened = {
              tone: "warn",
              text: "That link did not match any saved answers. You can start again below.",
            };
          }
        } catch {
          // Offline: carry on with whatever this browser has.
        }
      }

      if (cancelled) {
        return;
      }

      if (linked) {
        // Keep the private link out of the address bar and the history.
        window.history.replaceState(null, "", window.location.pathname);
      }

      commit(local ?? freshDraft());
      setNotice(opened);

      if (local?.started && !local.dirty) {
        setSaveState({
          tone: "ok",
          text: local.status === "submitted" ? "Submitted and saved" : "Saved",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [commit, endpoint, storageKey, survey]);

  const identified = (d: Draft) => isValidEmail(normalizeEmail(d.email)) && Boolean(d.area);

  const body = (d: Draft, status: SurveyStatus) =>
    JSON.stringify({
      id: d.id,
      email: normalizeEmail(d.email),
      area: d.area,
      answers: d.answers,
      status,
    });

  /** Saves are queued so an older one can never land on top of a newer one. */
  const save = (status?: SurveyStatus): Promise<SaveResult> => {
    const run = async (): Promise<SaveResult> => {
      const sent = draftRef.current;

      if (!sent || !identified(sent)) {
        return { ok: false };
      }

      setSaveState({ tone: "busy", text: "Saving…" });

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: body(sent, status ?? sent.status),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setSaveState({ tone: "off", text: "Not saved. Try again shortly" });
          return { ok: false, code: data.code, error: data.error };
        }

        const now = draftRef.current ?? sent;
        commit({
          ...now,
          email: data.email,
          status: data.status,
          submittedAt: data.submittedAt,
          started: true,
          // Still dirty if they kept typing while this was in flight.
          dirty: now.answers !== sent.answers || now.area !== sent.area,
        });
        setSaveState({
          tone: "ok",
          text: data.status === "submitted" ? "Submitted and saved" : "Saved",
        });
        return { ok: true, emailed: data.emailed };
      } catch {
        setSaveState({ tone: "off", text: "Not saved. Try again shortly" });
        return { ok: false };
      }
    };

    const result = saveChain.current.then(run);
    saveChain.current = result;
    return result;
  };

  // The last chance to save: the tab is closing or going to the background.
  useEffect(() => {
    const onHide = () => {
      const d = draftRef.current;

      if (d && d.dirty && isValidEmail(normalizeEmail(d.email)) && d.area) {
        navigator.sendBeacon(endpoint, body(d, d.status));
      }
    };

    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [endpoint]);

  const go = async (target: number) => {
    const d = draftRef.current;

    if (!d || busy) {
      return;
    }

    const next = Math.max(0, Math.min(reviewStep, target));
    setNotice(null);

    if (next > 0 && !identified(d)) {
      setStep(0);
      setThanks(false);
      setNotice({ tone: "warn", text: "Enter your email and choose your area to begin." });
      return;
    }

    if (!d.started && next > 0) {
      // Wait for the first save: it is what tells us whether this address has
      // already started elsewhere, and what sends the link.
      setBusy(true);
      const result = await save();
      setBusy(false);

      if (result.code === "already_started") {
        setStep(0);
        setNotice({ tone: "warn", text: result.error || "" });
        return;
      }

      if (result.emailed) {
        setNotice({
          tone: "good",
          text: `We have emailed ${normalizeEmail(d.email)} a private link. Use it to continue on any device, or to update your answers later.`,
        });
      }
    } else if (d.dirty) {
      void save();
    }

    setThanks(false);
    setStep(next);
    topRef.current?.scrollIntoView({ block: "start" });
  };

  const submit = async () => {
    setBusy(true);
    setNotice(null);
    const result = await save("submitted");
    setBusy(false);

    if (result.ok) {
      setThanks(true);
      topRef.current?.scrollIntoView({ block: "start" });
    } else {
      setNotice({
        tone: "warn",
        text:
          result.error ||
          "Your answers weren't sent. Check your connection and select Submit again.",
      });
    }
  };

  const header = (
    <header className={styles.band}>
      <div className={styles.bandIn}>
        <div className={styles.eyebrow}>{survey.eyebrow}</div>
        <h1>
          {survey.title} <em>{survey.titleAccent}</em>
        </h1>
      </div>
    </header>
  );

  const footer = (
    <footer className={styles.foot}>
      <span>{survey.footer}</span>
      <span>Prepared by DXI Marketing</span>
    </footer>
  );

  if (!survey.open) {
    return (
      <div className={styles.root}>
        {header}
        <main className={styles.wrap}>
          <div className={styles.intro}>
            <div className={styles.secKicker}>Closed</div>
            <h2 className={styles.display}>This questionnaire has closed.</h2>
            <p>It is no longer taking answers. Thank you to everyone who took part.</p>
          </div>
        </main>
        {footer}
      </div>
    );
  }

  if (!draft) {
    return (
      <div className={styles.root}>
        {header}
        <main className={styles.wrap}>
          <p>Loading…</p>
        </main>
        {footer}
      </div>
    );
  }

  const answeredTotal = countAnswered(survey, draft.answers);
  const countText = `${answeredTotal} of ${questions.length} answered`;
  const sectionStats = survey.sections.map((section) => ({
    total: section.questions.length,
    answered: section.questions.filter((q) => isAnswered(q, draft.answers[q.id])).length,
  }));
  const section = step > 0 && step < reviewStep ? survey.sections[step - 1] : null;

  const noticeBlock = notice && (
    <p className={cx(styles.note, styles.onPage, styles[notice.tone])} role="status">
      {notice.text}
    </p>
  );

  const navBar = (
    <div className={styles.nav}>
      {step > 0 ? (
        <button type="button" className={styles.btn} onClick={() => go(step - 1)}>
          ← {steps[step - 1]}
        </button>
      ) : (
        <span />
      )}
      {step < reviewStep && (
        <button
          type="button"
          className={cx(styles.btn, styles.primary)}
          disabled={busy}
          onClick={() => go(step + 1)}
        >
          {step === 0 ? (busy ? "Starting…" : draft.started ? "Continue" : "Start") : `Next: ${steps[step + 1]}`}{" "}
          →
        </button>
      )}
    </div>
  );

  let content: React.ReactNode;

  if (thanks) {
    content = (
      <div className={styles.intro}>
        <div className={styles.secKicker}>Submitted</div>
        <h2 className={styles.display}>Thank you. Your answers are in.</h2>
        <p>
          DXI Marketing will combine every executive&apos;s answers into one summary for the
          session, showing where the team agrees and where views differ.
        </p>
        <p>
          You can change your answers until the session. Come back to this page on this device, or
          use the link we emailed to {draft.email}.
        </p>
        <div className={styles.nav}>
          <button type="button" className={styles.btn} onClick={() => go(1)}>
            Review my answers
          </button>
        </div>
      </div>
    );
  } else if (step === 0) {
    content = (
      <div className={styles.intro}>
        <div className={styles.secKicker}>Ahead of the executive session</div>
        <h2 className={styles.display}>{survey.headline}</h2>
        <p>{survey.intro}</p>
        <div className={styles.facts}>
          <div className={styles.fact}>
            <b>About {survey.minutes} minutes</b>
            <span>
              {questions.length} questions in {survey.sections.length} short sections
            </span>
          </div>
          <div className={styles.fact}>
            <b>Saved as you go</b>
            <span>We email you a link to finish or update later</span>
          </div>
          <div className={styles.fact}>
            <b>In any order</b>
            <span>Jump between sections and skip what you like</span>
          </div>
          <div className={styles.fact}>
            <b>Confidential</b>
            <span>The session summary shows views by function, never by person</span>
          </div>
        </div>
        {noticeBlock}
        <div className={styles.who}>
          <div className={styles.field}>
            <label htmlFor="resp-email">Your email</label>
            <input
              type="email"
              id="resp-email"
              autoComplete="email"
              maxLength={254}
              value={draft.email}
              // Fixed once started: it is where the link to these answers went.
              readOnly={draft.started}
              onChange={(e) => edit({ email: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="resp-area">Your area</label>
            <select
              id="resp-area"
              value={draft.area}
              onChange={(e) => edit({ area: e.target.value })}
            >
              <option value="">Choose one</option>
              {survey.areas.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className={styles.note}>
          We ask for your email only to send you a private link back to your answers. Only DXI
          Marketing sees it. Your area gives your answers context: in the session, views are shown
          by theme and by function, never by name or email.
        </p>
        {navBar}
      </div>
    );
  } else if (section) {
    content = (
      <>
        {noticeBlock}
        <div className={styles.secHead}>
          <div className={styles.secKicker}>
            Section {step} · about {section.minutes} min
          </div>
          <h2 className={styles.display}>{section.title}</h2>
          <p>{section.lede}</p>
        </div>
        {section.questions.map((question) => (
          <section key={question.id} className={styles.q} id={`card-${question.id}`}>
            <div className={styles.qTop}>
              <span className={styles.qn}>Q{question.n}</span>
              <div>
                <h3 id={`h-${question.id}`}>{question.prompt}</h3>
                {question.help && <p className={styles.help}>{question.help}</p>}
              </div>
            </div>
            <div className={styles.qBody}>
              <QuestionBody
                question={question}
                value={draft.answers[question.id]}
                onChange={(value) =>
                  edit({ answers: { ...draftRef.current!.answers, [question.id]: value } })
                }
              />
            </div>
          </section>
        ))}
        {navBar}
      </>
    );
  } else {
    content = (
      <>
        <div className={styles.secHead}>
          <div className={styles.secKicker}>Final step</div>
          <h2 className={styles.display}>Review and submit</h2>
          <p>
            You can submit with gaps, but every answer helps. Select a question number to go back
            to it.
          </p>
        </div>
        <div className={styles.review}>
          {survey.sections.map((s, index) => {
            const missing = s.questions.filter((q) => !isAnswered(q, draft.answers[q.id]));

            return (
              <div key={s.key} className={styles.rv}>
                <b>{s.title}</b>
                {missing.length ? (
                  <span className={styles.partial}>
                    {s.questions.length - missing.length} of {s.questions.length}
                  </span>
                ) : (
                  <span className={styles.full}>Complete</span>
                )}
                {missing.length > 0 && (
                  <div className={styles.miss}>
                    <span>Not yet answered:</span>
                    {missing.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        className={styles.linkBtn}
                        onClick={async () => {
                          await go(index + 1);
                          // After the section has rendered.
                          setTimeout(() => {
                            document
                              .getElementById(`card-${q.id}`)
                              ?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }, 60);
                        }}
                      >
                        Q{q.n}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {noticeBlock}
        <p className={styles.note}>
          {draft.status === "submitted"
            ? `You submitted on ${new Date(draft.submittedAt || Date.now()).toLocaleDateString(undefined, { day: "numeric", month: "long" })}. You can change answers and submit again until the session.`
            : "Submitting shares your answers with DXI Marketing for the session summary."}
        </p>
        <div className={styles.nav}>
          <button type="button" className={styles.btn} onClick={() => go(step - 1)}>
            ← {steps[step - 1]}
          </button>
          <button
            type="button"
            className={cx(styles.btn, styles.gold)}
            disabled={busy}
            onClick={submit}
          >
            {draft.status === "submitted" ? "Submit updated answers" : "Submit my answers"}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className={styles.root}>
      {header}
      <main className={styles.wrap} ref={topRef}>
        <div className={styles.grid}>
          <nav className={styles.rail} aria-label="Sections">
            <div className={styles.railLabel}>Sections · answer in any order</div>
            {steps.map((title, index) => {
              const stats = sectionStats[index - 1];
              const isSection = index > 0 && index < reviewStep;

              return (
                <button
                  key={title}
                  type="button"
                  aria-current={index === step ? "step" : undefined}
                  className={cx(isSection && stats.answered === stats.total && styles.done)}
                  onClick={() => go(index)}
                >
                  <span className={styles.dot}>
                    {index === 0 ? "i" : index === reviewStep ? "✓" : index}
                  </span>
                  <span>{title}</span>
                  <span className={styles.cnt}>
                    {isSection ? `${stats.answered}/${stats.total}` : ""}
                  </span>
                </button>
              );
            })}
            <div className={styles.railMeta}>
              <span>{countText}</span>
              <span className={cx(styles.save, styles[saveState.tone])}>{saveState.text}</span>
            </div>
          </nav>
          <div className={styles.column}>
            {/* The phone's version of the rail: eight entries do not fit
                across a small screen, and a strip that scrolls sideways does
                not look like something you can use. */}
            <div className={cx(styles.field, styles.jump)}>
              <label htmlFor="jump">Jump to any section, in any order</label>
              <select id="jump" value={step} onChange={(e) => go(Number(e.target.value))}>
                {steps.map((title, index) => {
                  const stats = sectionStats[index - 1];

                  return (
                    <option key={title} value={index}>
                      {index > 0 && index < reviewStep
                        ? `${index}. ${title} (${stats.answered}/${stats.total})`
                        : title}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className={styles.mobileMeta}>
              <span>{countText}</span>
              <span className={cx(styles.save, styles[saveState.tone])}>{saveState.text}</span>
            </div>
            <div className={styles.progress} aria-hidden="true">
              <i style={{ width: `${(answeredTotal / questions.length) * 100}%` }} />
            </div>
            {content}
          </div>
        </div>
      </main>
      {footer}
    </div>
  );
}
