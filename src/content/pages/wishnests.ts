import type { Page } from "@/lib/sanity/types";
import { keyed, hero, showcase, toPath } from "../helpers";

/** The product lives on its own site — this page explains it and sends people there. */
const visit = toPath("See it on wishnests.com", "https://wishnests.com");

/** Phone screens taken from wishnests.com. */
const screen = (file: string, alt: string, caption: string) => ({
  src: `/images/wishnests/${file}`,
  alt,
  caption,
  width: 640,
  height: 1385,
});

export const wishnests: Page = {
  _id: "page-wishnests",
  title: "Wishnests",
  slug: "wishnests",
  breadcrumb: "PRODUCT NO. 01",
  seo: {
    title: "Wishnests — One Link. Every Wish. One Unforgettable Reveal.",
    description:
      "Wishnests, built by DXI: one private link that collects messages, photos, videos, voice notes and cash gifts for someone's big day, revealed all at once.",
  },
  sections: [
    hero({
      eyebrow: "Product No. 01 · Built by DXI",
      heading: "Wishnests",
      sub: "One link. Every wish. One unforgettable reveal.",
      ctas: [visit],
    }),

    showcase({
      logo: { src: "/images/wishnests/wordmark.png", alt: "Wishnests", width: 703, height: 160 },
      heading: "Every wish for their big day, in one place",
      body: "Create a nest for a birthday, wedding, graduation or any occasion, and share one link. Everyone sends messages, photos, videos, voice notes and cash gifts. No app, and guests don't need an account. Keep it a surprise, then reveal it all on the day.",
      cta: visit,
      shots: keyed([
        screen("guest.webp", "A guest's view of a nest, ready to send a wish", "Guests send a wish"),
        screen("dashboard.webp", "The organiser's dashboard with a live nest", "You run the nest"),
        screen("wallet.webp", "The wallet showing cash gifts to be paid out", "Cash gifts go to their bank"),
      ]),
    }),
  ],
};
