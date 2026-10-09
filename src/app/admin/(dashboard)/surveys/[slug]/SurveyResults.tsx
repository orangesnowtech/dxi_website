"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { shareOrigin } from "@/lib/links";
import {
  countAnswered,
  isAnswered,
  labelOf,
  sanitizeAnswer,
  surveyPath,
  surveyQuestions,
  type SingleAnswer,
  type SliderAnswer,
  type Survey,
  type SurveyQuestion,
  type SurveyResponse,
} from "@/lib/surveys";
import styles from "../../../admin.module.css";
import charts from "./results.module.css";

/** One person's answer to one question, with the function they answered from. */
type Entry<T> = { answer: T; area: string };

type Tone = "today" | "future" | "rating";

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const spread = (values: number[]) => Math.max(...values) - Math.min(...values);
const fmt = (value: number) => (Math.round(value * 10) / 10).toFixed(1);

/** A rating this far apart, or a 2030 target this far apart, is a disagreement. */
const RATING_SPLIT = 3;
const SLIDER_SPLIT = 5;

function formatDateTime(value: string | null | undefined) {
  return value
    ? new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })
    : "—";
}

function cx(...names: (string | false | null | undefined)[]) {
  return names.filter(Boolean).join(" ");
}

/** Each dot is one person; the line is the average. */
function DotRow({
  label,
  values,
  tone,
  min,
  max,
  split,
}: {
  label: string;
  values: number[];
  tone: Tone;
  min: number;
  max: number;
  split: boolean;
}) {
  const at = (value: number) => `${((value - min) / (max - min)) * 100}%`;
  const ticks: number[] = [];

  for (let tick = min; tick <= max; tick += max - min > 5 ? 5 : 1) {
    ticks.push(tick);
  }

  // People who gave the same score are fanned out sideways, so three dots on
  // a 4 read as three and not as one.
  const seen = new Map<number, number>();

  return (
    <div className={charts.dotRow}>
      <span>{label}</span>
      <div className={charts.dotPad}>
        <div className={charts.dotTrack}>
          {ticks.map((tick) => (
            <span key={tick} className={charts.tick} style={{ left: at(tick) }}>
              {tick}
            </span>
          ))}
          {values.map((value, index) => {
            const nth = seen.get(value) ?? 0;
            seen.set(value, nth + 1);

            return (
              <span
                key={index}
                className={cx(charts.dot, charts[tone])}
                style={{
                  left: at(value),
                  top: tone === "today" ? 10 : tone === "future" ? 2 : 6,
                  marginLeft: nth * 5,
                }}
              />
            );
          })}
          <span className={cx(charts.avg, charts[tone])} style={{ left: at(mean(values)) }} />
        </div>
      </div>
      <span className={charts.stat}>
        {split && <span className={charts.flag}>Split · </span>}
        avg {fmt(mean(values))}
      </span>
    </div>
  );
}

function Bars({ rows }: { rows: { label: string; width: number; value: string }[] }) {
  return (
    <div className={charts.bars}>
      {rows.map((row) => (
        <div key={row.label} className={charts.bar}>
          <span>{row.label}</span>
          <div className={charts.track}>
            <div className={charts.fill} style={{ width: `${row.width}%` }} />
          </div>
          <span className={charts.value}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function tally(values: string[]) {
  const counts: Record<string, number> = {};

  for (const value of values) {
    counts[value] = (counts[value] || 0) + 1;
  }

  return counts;
}

export default function SurveyResults({ survey }: { survey: Survey }) {
  const router = useRouter();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [includeDrafts, setIncludeDrafts] = useState(false);
  const [copied, setCopied] = useState(false);

  /** The live address, even when this dashboard is open on the preview host. */
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(shareOrigin(window.location.origin));
  }, []);

  const api = `/api/admin/surveys/${survey.slug}`;
  const shareUrl = `${origin}${surveyPath(survey.slug)}`;
  const questions = useMemo(() => surveyQuestions(survey), [survey]);

  const fetchResponses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(api);

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load responses");
      }

      setResponses(data.responses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [api, router]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const remove = async (response: SurveyResponse) => {
    const sure = window.confirm(
      `Delete the response from ${response.email}? Their answers are removed for good and their link stops working.`
    );

    if (!sure) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const result = await fetch(`${api}?id=${response.id}`, { method: "DELETE" });
      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.error || "Failed to delete the response");
      }

      setNotice(data.message);
      await fetchResponses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitted = responses.filter((response) => response.status === "submitted");
  const pool = includeDrafts ? responses : submitted;
  const areaLabel = (area: string) => labelOf(survey.areas, area) || "Area not given";

  /** Everybody in the pool who answered this question. */
  function entries<T>(question: SurveyQuestion): Entry<T>[] {
    return pool
      .filter((response) => isAnswered(question, response.answers?.[question.id]))
      .map((response) => ({
        answer: sanitizeAnswer(question, response.answers[question.id]) as T,
        area: response.area,
      }));
  }

  const splits: string[] = [];

  for (const question of questions) {
    if (question.type === "rating") {
      const given = entries<Record<string, number>>(question);

      for (const [key, label] of question.items) {
        const scores = given.map((e) => e.answer[key]).filter((score) => score !== undefined);

        if (scores.length > 1 && spread(scores) >= RATING_SPLIT) {
          splits.push(
            `Q${question.n} · ${label}: scores range from ${Math.min(...scores)} to ${Math.max(...scores)}`
          );
        }
      }
    } else if (question.type === "slider") {
      const targets = entries<SliderAnswer>(question).map((e) => e.answer.future);

      if (targets.length > 1 && spread(targets) >= SLIDER_SPLIT) {
        splits.push(
          `Q${question.n} · ${question.lo} or ${question.hi}: 2030 targets range from ${Math.min(...targets)} to ${Math.max(...targets)} out of 10`
        );
      }
    } else if (question.type === "single") {
      const picks = entries<SingleAnswer>(question).map((e) => e.answer.v);

      if (picks.length > 2 && Math.max(...Object.values(tally(picks))) / picks.length < 0.5) {
        splits.push(
          `Q${question.n} · ${question.prompt.replace(/\?$/, "")}: no option has majority support`
        );
      }
    }
  }

  const renderAnswers = (question: SurveyQuestion) => {
    switch (question.type) {
      case "words3": {
        const counts = tally(
          entries<string[]>(question).flatMap((e) =>
            e.answer.map((word) => word.toLowerCase()).filter(Boolean)
          )
        );

        return (
          <div className={charts.chips}>
            {Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([word, count]) => (
                <span key={word} className={charts.chip}>
                  {word}
                  {count > 1 && <i>×{count}</i>}
                </span>
              ))}
          </div>
        );
      }

      case "three":
        return (
          <ul className={charts.quotes}>
            {entries<string[]>(question).flatMap((e, person) =>
              e.answer.filter(Boolean).map((item, index) => (
                <li key={`${person}-${index}`}>
                  {item}
                  <small>{areaLabel(e.area)}</small>
                </li>
              ))
            )}
          </ul>
        );

      case "text":
        return (
          <ul className={charts.quotes}>
            {entries<string>(question).map((e, person) => (
              <li key={person}>
                {e.answer}
                <small>{areaLabel(e.area)}</small>
              </li>
            ))}
          </ul>
        );

      case "fields": {
        // Laid out for the question's own pairing: a name, then the reason.
        type Field = (typeof question.fields)[number];
        const pairs: (readonly [Field, Field | undefined])[] = [];

        for (let index = 0; index < question.fields.length; index += 2) {
          pairs.push([question.fields[index], question.fields[index + 1]]);
        }

        return (
          <ul className={charts.quotes}>
            {entries<Record<string, string>>(question).flatMap((e, person) =>
              pairs
                .filter(([name, why]) => e.answer[name[0]] || (why && e.answer[why[0]]))
                .map(([name, why]) => (
                  <li key={`${person}-${name[0]}`}>
                    <b>{e.answer[name[0]] || "(not named)"}</b>
                    {why && e.answer[why[0]] ? ` · ${e.answer[why[0]]}` : ""}
                    <small>
                      {name[1].replace(/ \(optional\)$/, "")} · {areaLabel(e.area)}
                    </small>
                  </li>
                ))
            )}
          </ul>
        );
      }

      case "rating": {
        const given = entries<Record<string, number>>(question);

        return (
          <>
            <div className={charts.legend}>
              <span style={{ "--c": "var(--navy)" } as React.CSSProperties}>
                Each dot is one executive; the line is the average. 1 = {question.lo}, 5 ={" "}
                {question.hi}
              </span>
            </div>
            <div className={charts.dots}>
              {question.items.map(([key, label]) => {
                const scores = given.map((e) => e.answer[key]).filter((s) => s !== undefined);

                return scores.length ? (
                  <DotRow
                    key={key}
                    label={label}
                    values={scores}
                    tone="rating"
                    min={1}
                    max={5}
                    split={spread(scores) >= RATING_SPLIT}
                  />
                ) : null;
              })}
            </div>
          </>
        );
      }

      case "matrix": {
        const given = entries<Record<string, string>>(question);

        return (
          <div className={charts.grid}>
            <table>
              <thead>
                <tr>
                  <th>Group</th>
                  {question.cols.map(([key, label]) => (
                    <th key={key}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.rows.map(([rowKey, rowLabel]) => {
                  const counts = tally(given.map((e) => e.answer[rowKey]).filter(Boolean));
                  const top = Math.max(0, ...Object.values(counts));

                  return (
                    <tr key={rowKey}>
                      <td>{rowLabel}</td>
                      {question.cols.map(([colKey]) => (
                        <td
                          key={colKey}
                          className={counts[colKey] && counts[colKey] === top ? charts.hot : ""}
                        >
                          {counts[colKey] || "·"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }

      case "single": {
        const given = entries<SingleAnswer>(question);
        const counts = tally(given.map((e) => e.answer.v));
        const most = Math.max(1, ...Object.values(counts));
        const remarks = given.filter((e) => e.answer.other || e.answer.c);

        return (
          <>
            <Bars
              rows={question.options.map(([key, label]) => ({
                label,
                width: ((counts[key] || 0) / most) * 100,
                value: String(counts[key] || 0),
              }))}
            />
            {remarks.length > 0 && (
              <ul className={cx(charts.quotes, charts.spaced)}>
                {remarks.map((e, person) => (
                  <li key={person}>
                    {[e.answer.other, e.answer.c].filter(Boolean).join(" · ")}
                    <small>
                      {labelOf(question.options, e.answer.v)} · {areaLabel(e.area)}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </>
        );
      }

      case "multi": {
        const counts = tally(entries<string[]>(question).flatMap((e) => e.answer));
        const most = Math.max(1, ...Object.values(counts));

        return (
          <Bars
            rows={question.options
              .map(([key, label]) => ({ label, count: counts[key] || 0 }))
              .sort((a, b) => b.count - a.count)
              .map(({ label, count }) => ({
                label,
                width: (count / most) * 100,
                value: String(count),
              }))}
          />
        );
      }

      case "rank": {
        const orders = entries<string[]>(question).map((e) => e.answer);
        const size = question.items.length;
        const ranked = question.items
          .map(([key, label]) => ({
            label,
            position: mean(orders.map((order) => order.indexOf(key) + 1)),
          }))
          .sort((a, b) => a.position - b.position);

        return (
          <>
            <p className={cx(charts.quiet, charts.above)}>
              Average position (1 = most important)
            </p>
            <Bars
              rows={ranked.map(({ label, position }, index) => ({
                label: `${index + 1}. ${label}`,
                width: ((size + 1 - position) / size) * 100,
                value: fmt(position),
              }))}
            />
          </>
        );
      }

      case "slider": {
        const given = entries<SliderAnswer>(question);
        const today = given.map((e) => e.answer.today);
        const future = given.map((e) => e.answer.future);
        const shift = mean(future) - mean(today);

        return (
          <>
            <div className={charts.legend}>
              <span style={{ "--c": "var(--today)" } as React.CSSProperties}>Today</span>
              <span style={{ "--c": "var(--gold)" } as React.CSSProperties}>By 2030</span>
            </div>
            <div className={charts.poles}>
              <span>0 · {question.lo}</span>
              <span>{question.hi} · 10</span>
            </div>
            <div className={charts.dots}>
              <DotRow label="Today" values={today} tone="today" min={0} max={10} split={false} />
              <DotRow
                label="By 2030"
                values={future}
                tone="future"
                min={0}
                max={10}
                split={spread(future) >= SLIDER_SPLIT}
              />
            </div>
            <p className={cx(charts.quiet, charts.below)}>
              Average shift: {shift >= 0 ? "+" : ""}
              {fmt(shift)} toward {(shift >= 0 ? question.hi : question.lo).toLowerCase()}
            </p>
          </>
        );
      }
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.pageNav}>
            <Link href="/admin/surveys" className={styles.backLink}>
              ← All surveys
            </Link>
            <Link
              href={surveyPath(survey.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navLink}
            >
              Open the form ↗
            </Link>
            <a href={`${api}/export`} className={styles.navLink}>
              Download CSV
            </a>
          </div>
          <h1>{survey.name}</h1>
          <p className={styles.subtitle}>
            {survey.client} · link to share:{" "}
            <button type="button" className={styles.copyCodeBtn} onClick={copyLink}>
              {copied ? "Copied" : shareUrl}
            </button>
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {notice && <div className={styles.success}>{notice}</div>}

        <div className={styles.controls}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={includeDrafts}
              onChange={(e) => setIncludeDrafts(e.target.checked)}
            />
            Include answers still in progress in the summary
          </label>
          <div className={styles.stats}>
            <span>
              Submitted: <strong>{submitted.length}</strong>
            </span>
            <span>
              In progress: <strong>{responses.length - submitted.length}</strong>
            </span>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading responses…</div>
        ) : responses.length === 0 ? (
          <div className={styles.empty}>
            Nobody has started yet. Responses appear here as soon as someone begins.
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Area</th>
                    <th>Status</th>
                    <th>Answered</th>
                    <th>Last updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {responses.map((response) => (
                    <tr key={response.id} className={styles.row}>
                      <td className={styles.name}>{response.email}</td>
                      <td>{areaLabel(response.area)}</td>
                      <td>{response.status === "submitted" ? "Submitted" : "In progress"}</td>
                      <td>
                        {countAnswered(survey, response.answers || {})} of {questions.length}
                      </td>
                      <td>{formatDateTime(response.updatedAt)}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          disabled={busy}
                          onClick={() => remove(response)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={charts.summary}>
              {pool.length === 0 ? (
                <div className={styles.empty}>
                  No one has submitted yet. Tick the box above to preview the summary from answers
                  still in progress.
                </div>
              ) : (
                <>
                  {splits.length > 0 && (
                    <div className={charts.split}>
                      <h3>Where the team disagrees</h3>
                      <p>
                        Wide spreads and split votes. These are the discussion points for the
                        session.
                      </p>
                      <ul>
                        {splits.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {survey.sections.map((section) => (
                    <section key={section.key}>
                      <h2 className={charts.sectionTitle}>{section.title}</h2>
                      {section.questions.map((question) => (
                        <div key={question.id} className={charts.card}>
                          <h4>
                            <span className={charts.qn}>Q{question.n}</span>
                            <span>{question.prompt}</span>
                          </h4>
                          {entries(question).length ? (
                            renderAnswers(question)
                          ) : (
                            <p className={charts.quiet}>No answers yet.</p>
                          )}
                        </div>
                      ))}
                    </section>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
