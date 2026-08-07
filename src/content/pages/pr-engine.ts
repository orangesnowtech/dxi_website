import type { Page } from "@/lib/sanity/types";
import { keyed, hero, cards, closing, wa, anchor } from "../helpers";

export const prEngine: Page = {
  _id: "page-pr-engine",
  title: "PR Engine",
  slug: "pr-engine",
  breadcrumb: "ENGINE NO. 04",
  seo: {
    title: "DXI PR Engine — Verified Placements, Not Effort",
    description:
      "Real stories developed by real writers, published on real platforms. Every placement a live URL you can check.",
  },
  sections: [
    hero({
      eyebrow: "Engine No. 04 · The credibility engine",
      heading: "PR\nEngine",
      sub: "Traditional PR sells effort — retainers, releases, hope. The PR Engine sells outcomes: real stories, developed by real writers, published on real platforms. Every placement a live URL you can check.",
      ctas: [
        wa("Bring us your story", "Hello DXI, I have news for the PR Engine."),
        anchor("How it works", "how"),
      ],
    }),

    cards({
      sectionId: "how",
      eyebrow: "How it works",
      heading: "From media kit to live coverage",
      body: "You provide the announcement — the facts, the images, the story. Writers from the DXI Market Force network develop it into real coverage across platforms chosen with you by tier and audience fit.",
      cards: keyed([
        {
          title: "Developed, not blasted",
          body: "No spray-and-pray press releases. Writers build genuine stories from your media kit — angles their audiences actually read.",
        },
        {
          title: "Approved before publishing",
          body: "Every piece passes DXI approval: facts checked against your kit, brand rules met, sponsored content transparently labelled — which is what keeps it credible.",
        },
        {
          title: "Verified, or it doesn't count",
          body: "You pay for placements that publish and stay live, confirmed by a live-check. Your closing report is a list of URLs, not a list of efforts.",
        },
      ]),
    }),

    cards({
      background: "ash",
      columns: 2,
      eyebrow: "Who it serves",
      heading: "News worth spreading",
      cards: keyed([
        {
          title: "Launches & announcements",
          body: "A product drop, a partnership, a milestone — a coordinated set of stories landing across platforms in your window, while it's still news.",
          tone: "light" as const,
        },
        {
          title: "Credibility building",
          body: "Startups and growing businesses whose investors and partners Google them and find nothing. The PR Engine builds the searchable press trail.",
          tone: "dark" as const,
        },
      ]),
      band: {
        text: "Pairs with the Viral Engine: *stories in the press, clips in the feeds.* One launch, full spectrum.",
        cta: wa("Brief us", "Hello DXI, I have news for the PR Engine."),
      },
    }),

    closing({
      heading: "Got news? Make it travel.",
      body: "Bring us the announcement — we'll map the platforms, tiers, and timeline.",
      ctas: [wa("Chat on WhatsApp", "Hello DXI, I have news for the PR Engine.")],
    }),
  ],
};
