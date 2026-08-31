/**
 * Shapes returned by the GROQ queries in `queries.ts`.
 *
 * These mirror the schemas in `packages/sanity-shared/schemaTypes`. When a
 * schema field changes, change it here and in the query projection together.
 */

/* ── Shared ─────────────────────────────────────────────────────────────── */

export type CtaKind = "whatsapp" | "anchor" | "page" | "tel" | "url" | "static";
export type CtaStyle = "signal" | "ink" | "line" | "lineInverse";

export interface Cta {
  label: string;
  kind: CtaKind;
  message?: string;
  anchor?: string;
  /** Resolved from the page reference by the query, not stored on the CTA. */
  pageSlug?: string;
  path?: string;
  style?: CtaStyle;
}

export interface Band {
  text: string;
  cta?: Cta;
}

export type Background = "paper" | "ash" | "dark";
export type Access = "free" | "members";

/**
 * The pricing ladder. A capability tagged at a tier is included at that tier
 * and every tier above it, so features carry the tier they *first* appear at.
 */
export type Tier = "starter" | "standard" | "scale";

interface SectionBase {
  _key: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  sectionId?: string;
  background?: Background;
}

/* ── Sections ───────────────────────────────────────────────────────────── */

export interface HeroSection {
  _key: string;
  _type: "heroSection";
  eyebrow?: string;
  heading: string;
  sub?: string;
  ctas?: Cta[];
  tone?: "dark" | "light";
  showLowerNotch?: boolean;
}

export interface IntroSection extends SectionBase {
  _type: "introSection";
}

export interface CardItem {
  _key: string;
  eyebrow?: string;
  step?: string;
  title: string;
  body?: string;
  tone?: "light" | "dark";
  emphasis?: boolean;
  showTick?: boolean;
  cta?: Cta;
}

export interface CardGridSection extends SectionBase {
  _type: "cardGrid";
  columns?: 2 | 3;
  cards?: CardItem[];
  band?: Band;
}

export interface PlatePrice {
  amount?: string;
  unit?: string;
  recurringAmount?: string;
}

export interface PlateItem {
  _key: string;
  kicker?: string;
  kickerRight?: string;
  title: string;
  role?: string;
  description?: string;
  price?: PlatePrice;
  specs?: string[];
  footLabel?: string;
  tone?: "default" | "dark" | "lead";
  link?: Cta;
}

export interface PlateGridSection extends SectionBase {
  _type: "plateGrid";
  columns?: 2 | 3;
  plates?: PlateItem[];
  band?: Band;
}

export interface FeaturePoint {
  _key: string;
  text: string;
  tier: Tier;
}

export interface FeatureItem {
  _key: string;
  title: string;
  /** The clause after the em dash in the heading — "one inbox for every channel". */
  lede?: string;
  body?: string;
  tier: Tier;
  points?: FeaturePoint[];
}

export interface FeatureListSection extends SectionBase {
  _type: "featureList";
  /** Legend above the grid — explains the ladder and that rows open. */
  caption?: string;
  features?: FeatureItem[];
  band?: Band;
}

export interface StatItem {
  _key: string;
  value: string;
  label: string;
  detail?: string;
}

export interface StatsSection extends SectionBase {
  _type: "statsSection";
  stats?: StatItem[];
}

export interface StepItem {
  _key: string;
  title: string;
  body?: string;
}

export interface StepsSection extends SectionBase {
  _type: "stepsSection";
  steps?: StepItem[];
}

export interface FaqItem {
  _key: string;
  question: string;
  answer: string;
}

export interface FaqSection extends SectionBase {
  _type: "faqSection";
  items?: FaqItem[];
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  access: Access;
  url?: string;
  order?: number;
}

export interface CourseGridSection extends SectionBase {
  _type: "courseGrid";
  /** Joined in by the query — courses are not stored on the section. */
  courses?: Course[];
}

export interface Webinar {
  _id: string;
  title: string;
  description: string;
  startsAt: string;
  access: Access;
  registrationUrl?: string;
}

export interface WebinarGridSection extends SectionBase {
  _type: "webinarGrid";
  includePast?: boolean;
  /** Joined in by the query — webinars are not stored on the section. */
  webinars?: Webinar[];
}

/** Portable Text blocks — loosely typed, rendered by @portabletext/react. */
export interface RichSection extends SectionBase {
  _type: "richSection";
  content?: unknown[];
}

export interface CtaSection {
  _key: string;
  _type: "ctaSection";
  heading: string;
  body?: string;
  ctas?: Cta[];
  sectionId?: string;
}

export type Section =
  | HeroSection
  | IntroSection
  | CardGridSection
  | PlateGridSection
  | FeatureListSection
  | StatsSection
  | StepsSection
  | FaqSection
  | CourseGridSection
  | WebinarGridSection
  | RichSection
  | CtaSection;

/* ── Documents ──────────────────────────────────────────────────────────── */

export interface Seo {
  title?: string;
  description?: string;
  imageUrl?: string;
}

export interface Page {
  _id: string;
  title: string;
  slug: string;
  breadcrumb?: string;
  sections?: Section[];
  seo?: Seo;
}

export interface NavLink {
  _key: string;
  label: string;
  slug: string;
}

export interface SiteSettings {
  whatsappNumber: string;
  phoneDisplay?: string;
  phoneDial?: string;
  navLinks?: NavLink[];
  navCta?: Cta;
  footerTagline?: string;
  footerContact?: string;
}
