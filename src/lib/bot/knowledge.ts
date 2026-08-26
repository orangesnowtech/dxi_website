import { pages } from "@/content/pages";
import { siteSettings } from "@/content/site";
import {
  BANK_DETAILS,
  MEMBERSHIP_FEE_LABEL,
  PAYMENT_WINDOW_LABEL,
} from "@/lib/academy";
import type { Page, Section } from "@/lib/sanity/types";

/**
 * The assistant's grounding, built from the same content the site renders.
 *
 * This is the whole argument for the bot living in this repo. Every answer
 * comes from `src/content`, so the moment a page is edited the assistant says
 * the new thing. A copy in another codebase would be wrong the first time
 * somebody changed a price and told nobody.
 *
 * Deliberately plain text rather than JSON: the model reads it as prose, and
 * prose is what it has to produce back.
 */

/** Flattens one section into readable lines, or nothing if it has no words. */
function sectionToText(section: Section): string[] {
  const lines: string[] = [];
  const push = (value?: string) => {
    const trimmed = value?.trim();
    if (trimmed) lines.push(trimmed);
  };

  // Common heading/body fields, present on most section types.
  if ("heading" in section) push(section.heading?.replace(/\n/g, " "));
  if ("body" in section) push(section.body);
  if ("sub" in section) push(section.sub);

  switch (section._type) {
    case "cardGrid":
      for (const card of section.cards ?? []) {
        push([card.title, card.body].filter(Boolean).join(" — "));
      }
      push(section.band?.text);
      break;

    case "plateGrid":
      for (const plate of section.plates ?? []) {
        const price = plate.price?.amount
          ? ` (${plate.price.amount}${plate.price.unit ? ` ${plate.price.unit}` : ""})`
          : "";
        push(`${plate.title}${price}${plate.role ? ` — ${plate.role}` : ""}`);
        push(plate.description);
        for (const spec of plate.specs ?? []) push(`  • ${spec}`);
      }
      push(section.band?.text);
      break;

    case "statsSection":
      for (const stat of section.stats ?? []) {
        push(`${stat.value} — ${stat.label}${stat.detail ? `. ${stat.detail}` : ""}`);
      }
      break;

    case "stepsSection":
      (section.steps ?? []).forEach((step, index) => {
        push(`${index + 1}. ${step.title}${step.body ? ` — ${step.body}` : ""}`);
      });
      break;

    case "faqSection":
      for (const item of section.items ?? []) {
        push(`Q: ${item.question}`);
        push(`A: ${item.answer}`);
      }
      break;

    default:
      // heroSection, introSection, ctaSection and the joined grids are already
      // covered by the shared heading/body handling above. `richSection` is
      // Portable Text and is skipped rather than half-rendered.
      break;
  }

  return lines;
}

function pageToText(page: Page): string {
  const body = (page.sections ?? []).flatMap(sectionToText).join("\n");
  return `## ${page.title}  (${page.slug === "home" ? "/" : `/${page.slug}`})\n${body}`;
}

/** Every page, flattened. Computed once per server instance. */
let cachedPages: string | null = null;

export function siteKnowledge(): string {
  if (!cachedPages) {
    cachedPages = pages.map(pageToText).join("\n\n");
  }

  return cachedPages;
}

/**
 * Facts that live in code rather than in page content, and that the assistant
 * gets asked about constantly.
 *
 * The bank details are included so the model can recognise a question about
 * paying — not so it can volunteer them. The system prompt forbids sending
 * account numbers, because payment details belong in an email that follows an
 * approval, never in a chat window.
 */
export function operationalFacts(): string {
  return [
    `Academy membership: ${MEMBERSHIP_FEE_LABEL} per year.`,
    `Academy applicants are reviewed before being offered a place. Approved applicants are emailed payment details and have ${PAYMENT_WINDOW_LABEL} to pay.`,
    `Payment is by bank transfer only (${BANK_DETAILS.bankName}). Never share account numbers in chat — they are sent by email after approval.`,
    `The business profile application form is at /business-profile.`,
    `Events, webinars and trainings are listed at /events.`,
    `WhatsApp: ${siteSettings.phoneDisplay ?? ""}. Website: dximarketing.com.`,
  ].join("\n");
}
