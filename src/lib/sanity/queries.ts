import { groq } from "next-sanity";
import { client } from "./client";
import type { Page, SiteSettings } from "./types";

/**
 * A CTA stores a reference to a page, but the site only needs the slug — so
 * every projection that pulls a CTA flattens it here.
 */
const CTA_FIELDS = groq`
  label,
  kind,
  message,
  anchor,
  "pageSlug": page->slug.current,
  path,
  style
`;

const BAND_FIELDS = groq`
  text,
  cta{ ${CTA_FIELDS} }
`;

/**
 * The section array is polymorphic: each block type projects only its own
 * fields. Keep this in step with the `of: [...]` list on the page schema —
 * a block type missing here renders as an unknown section and is skipped.
 */
const SECTION_FIELDS = groq`
  _key,
  _type,

  _type == "heroSection" => {
    eyebrow,
    heading,
    sub,
    tone,
    showLowerNotch,
    ctas[]{ ${CTA_FIELDS} }
  },

  _type == "introSection" => {
    eyebrow, heading, body, sectionId, background
  },

  _type == "cardGrid" => {
    eyebrow, heading, body, sectionId, background, columns,
    cards[]{
      _key, eyebrow, step, title, body, tone, emphasis, showTick,
      cta{ ${CTA_FIELDS} }
    },
    band{ ${BAND_FIELDS} }
  },

  _type == "plateGrid" => {
    eyebrow, heading, body, sectionId, background, columns,
    plates[]{
      _key, kicker, kickerRight, title, role, description,
      price{ amount, unit, recurringAmount },
      specs, footLabel, tone,
      link{ ${CTA_FIELDS} }
    },
    band{ ${BAND_FIELDS} }
  },

  _type == "statsSection" => {
    eyebrow, heading, body, sectionId,
    stats[]{ _key, value, label, detail }
  },

  _type == "stepsSection" => {
    eyebrow, heading, body, sectionId, background,
    steps[]{ _key, title, body }
  },

  _type == "faqSection" => {
    eyebrow, heading, body, sectionId, background,
    items[]{ _key, question, answer }
  },

  _type == "courseGrid" => {
    eyebrow, heading, body, sectionId, background,
    "courses": *[_type == "course" && published == true] | order(order asc){
      _id, title, description, access, url, order
    }
  },

  _type == "webinarGrid" => {
    eyebrow, heading, body, sectionId, background, includePast,
    "webinars": *[
      _type == "webinar"
        && published == true
        && (^.includePast == true || startsAt > now())
    ] | order(startsAt asc){
      _id, title, description, startsAt, access, registrationUrl
    }
  },

  _type == "richSection" => {
    eyebrow, heading, body, sectionId, background, content
  },

  _type == "ctaSection" => {
    heading, body, sectionId,
    ctas[]{ ${CTA_FIELDS} }
  }
`;

const PAGE_BY_SLUG = groq`
  *[_type == "page" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    breadcrumb,
    sections[]{ ${SECTION_FIELDS} },
    seo{
      title,
      description,
      "imageUrl": image.asset->url
    }
  }
`;

const ALL_PAGE_SLUGS = groq`
  *[_type == "page" && defined(slug.current)].slug.current
`;

const SITE_SETTINGS = groq`
  *[_type == "siteSettings"][0]{
    whatsappNumber,
    phoneDisplay,
    phoneDial,
    navLinks[]{
      _key,
      label,
      "slug": page->slug.current
    },
    navCta{ ${CTA_FIELDS} },
    footerTagline,
    footerContact
  }
`;

export async function getPage(slug: string): Promise<Page | null> {
  return client.fetch<Page | null>(PAGE_BY_SLUG, { slug });
}

export async function getAllPageSlugs(): Promise<string[]> {
  const slugs = await client.fetch<(string | null)[]>(ALL_PAGE_SLUGS);
  return slugs.filter((slug): slug is string => Boolean(slug));
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch<SiteSettings | null>(SITE_SETTINGS);
}
