import type { SiteSettings } from "@/lib/sanity/types";
import { keyed, wa } from "./helpers";

/**
 * Navigation, footer and contact details.
 *
 * The WhatsApp number lives here and nowhere else — every WhatsApp button on
 * the site carries only its message text, so changing it here changes it
 * everywhere.
 */
export const siteSettings: SiteSettings = {
  whatsappNumber: "2348074533441",
  phoneDisplay: "0807 453 3441",
  phoneDial: "+2348074533441",
  navLinks: keyed([
    { label: "Home", slug: "home" },
    { label: "Sales Engine", slug: "sales-engine" },
    { label: "Content", slug: "content" },
    { label: "Viral", slug: "viral-engine" },
    { label: "PR", slug: "pr-engine" },
    { label: "Market Force", slug: "market-force" },
    { label: "Academy", slug: "academy" },
    { label: "Events", slug: "events" },
  ]),
  navCta: wa("WhatsApp Us", "Hello DXI, I'd like to talk."),
  footerTagline: "DIGITAL eXPERIENCES AND INTEGRATED MARKETING · LAGOS",
  footerContact: "DXIMARKETING.COM · 0807 453 3441",
};
