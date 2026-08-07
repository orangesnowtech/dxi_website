import type { Page, SiteSettings } from "./sanity/types";
import { pages, pagesBySlug } from "@/content/pages";
import { siteSettings } from "@/content/site";

/**
 * The site's data layer.
 *
 * Content currently lives in `src/content` as typed TypeScript, because the
 * Sanity dataset does not exist yet. The functions below return exactly what
 * the GROQ queries in `sanity/queries.ts` return, so switching over is a change
 * to this file alone — nothing in `app/` knows the difference.
 *
 * To switch to Sanity:
 *   1. Create the dataset and run `node scripts/seed-content.js`.
 *   2. Replace the bodies below with the `getPage` / `getAllPageSlugs` /
 *      `getSiteSettings` imports from `./sanity/queries`.
 *   3. Delete `src/content`.
 */

export async function getPage(slug: string): Promise<Page | null> {
  return pagesBySlug.get(slug) ?? null;
}

export async function getAllPageSlugs(): Promise<string[]> {
  return pages.map((page) => page.slug);
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return siteSettings;
}
