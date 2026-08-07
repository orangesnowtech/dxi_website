import type { ReactNode } from "react";
import { createElement, Fragment } from "react";
import type { Cta, SiteSettings } from "./sanity/types";

/**
 * Turns a CTA into an href.
 *
 * Returns null for CTAs that are deliberately not clickable — the Academy's
 * "Sent after your profile" step, for example — so callers render a span.
 */
export function resolveCtaHref(cta: Cta, settings: SiteSettings | null): string | null {
  switch (cta.kind) {
    case "whatsapp": {
      const number = settings?.whatsappNumber;
      if (!number) return null;
      const text = cta.message ? `?text=${encodeURIComponent(cta.message)}` : "";
      return `https://wa.me/${number}${text}`;
    }
    case "anchor":
      return cta.anchor ? `#${cta.anchor}` : null;
    case "page":
      if (!cta.pageSlug) return null;
      return cta.pageSlug === "home" ? "/" : `/${cta.pageSlug}`;
    case "tel": {
      const dial = settings?.phoneDial;
      return dial ? `tel:${dial}` : null;
    }
    case "url":
      return cta.path || null;
    case "static":
      return null;
    default:
      return null;
  }
}

/** A page slug's public path. "home" is served at the root. */
export function pagePath(slug: string): string {
  return slug === "home" ? "/" : `/${slug}`;
}

/**
 * Renders *asterisk-wrapped* runs in red.
 *
 * Editors use this in band statements and plate spec lines, where a phrase or
 * two needs to pop without giving them a full rich-text editor. Unmatched
 * asterisks are left as literal text.
 */
export function withEmphasis(text: string, className = "text-signal"): ReactNode {
  const parts = text.split(/\*([^*]+)\*/g);
  return createElement(
    Fragment,
    null,
    ...parts.map((part, i) =>
      // Odd indices are the captured groups — the bits between asterisks.
      i % 2 === 1 ? createElement("span", { key: i, className }, part) : part
    )
  );
}

/** Splits a headline on newlines so authors control where lines break. */
export function headingLines(heading: string): string[] {
  return heading.split("\n").map((line) => line.trim()).filter(Boolean);
}

/** "12 March 2026 · 4:00 PM" for webinar cards. */
export function formatSessionTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
  const time = date.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
  return `${day} · ${time}`;
}
