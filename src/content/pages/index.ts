import type { Page } from "@/lib/sanity/types";
import { home } from "./home";
import { salesEngine } from "./sales-engine";
import { contentEngine } from "./content-engine";
import { viralEngine } from "./viral-engine";
import { prEngine } from "./pr-engine";
import { marketForce } from "./market-force";
import { academy } from "./academy";
import { wishnests } from "./wishnests";

/** Every page on the site, in navigation order. */
export const pages: Page[] = [
  home,
  salesEngine,
  contentEngine,
  viralEngine,
  prEngine,
  wishnests,
  marketForce,
  academy,
];

export const pagesBySlug = new Map(pages.map((page) => [page.slug, page]));
