import type { Cta, Section } from "@/lib/sanity/types";

/**
 * Authoring helpers for the hardcoded content in this folder.
 *
 * The content is typed against the same shapes the Sanity queries return, so
 * the components never learn where the data came from. When the dataset is
 * ready, `src/lib/data.ts` switches source and this folder is deleted.
 */

let keyCounter = 0;
/** Components key off `_key`, so stamp a stable one rather than using indexes. */
export const key = () => `k${(keyCounter++).toString(36)}`;

/** Adds a `_key` to each item so arrays satisfy the query-shaped types. */
export function keyed<T>(items: T[]): (T & { _key: string })[] {
  return items.map((item) => ({ ...item, _key: key() }));
}

/* ── Buttons ──────────────────────────────────────────────────────────── */

export const wa = (label: string, message: string, style: Cta["style"] = "signal"): Cta => ({
  label,
  kind: "whatsapp",
  message,
  style,
});

export const anchor = (
  label: string,
  target: string,
  style: Cta["style"] = "lineInverse"
): Cta => ({ label, kind: "anchor", anchor: target, style });

export const toPage = (label: string, slug: string, style: Cta["style"] = "signal"): Cta => ({
  label,
  kind: "page",
  pageSlug: slug,
  style,
});

export const toPath = (label: string, path: string, style: Cta["style"] = "signal"): Cta => ({
  label,
  kind: "url",
  path,
  style,
});

export const tel = (label: string, style: Cta["style"] = "lineInverse"): Cta => ({
  label,
  kind: "tel",
  style,
});

export const staticCta = (label: string): Cta => ({ label, kind: "static", style: "signal" });

/* ── Sections ─────────────────────────────────────────────────────────── */

type Without<T> = Omit<T, "_key" | "_type">;

const section =
  <T extends Section>(type: T["_type"], defaults: Partial<Without<T>> = {}) =>
  (fields: Without<T>): T =>
    ({ _key: key(), _type: type, ...defaults, ...fields }) as T;

export const hero = section<Extract<Section, { _type: "heroSection" }>>("heroSection", {
  tone: "dark",
});
export const intro = section<Extract<Section, { _type: "introSection" }>>("introSection", {
  background: "paper",
});
export const cards = section<Extract<Section, { _type: "cardGrid" }>>("cardGrid", {
  background: "paper",
  columns: 3,
});
export const plates = section<Extract<Section, { _type: "plateGrid" }>>("plateGrid", {
  background: "paper",
  columns: 3,
});
export const features = section<Extract<Section, { _type: "featureList" }>>("featureList", {
  background: "paper",
});
export const stats = section<Extract<Section, { _type: "statsSection" }>>("statsSection");
export const steps = section<Extract<Section, { _type: "stepsSection" }>>("stepsSection", {
  background: "paper",
});
export const faq = section<Extract<Section, { _type: "faqSection" }>>("faqSection", {
  background: "paper",
});
export const courseGrid = section<Extract<Section, { _type: "courseGrid" }>>("courseGrid", {
  background: "paper",
});
export const webinarGrid = section<Extract<Section, { _type: "webinarGrid" }>>("webinarGrid", {
  background: "paper",
});
export const richText = section<Extract<Section, { _type: "richSection" }>>("richSection", {
  background: "paper",
});
export const closing = section<Extract<Section, { _type: "ctaSection" }>>("ctaSection");
