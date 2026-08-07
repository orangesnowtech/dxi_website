import type { Page } from "@/lib/sanity/types";
import { keyed, hero, cards, plates, faq, closing, wa, anchor } from "../helpers";

export const viralEngine: Page = {
  _id: "page-viral-engine",
  title: "Viral Engine",
  slug: "viral-engine",
  breadcrumb: "ENGINE NO. 03",
  seo: {
    title: "DXI Viral Engine — Pay For Views, Not Posts",
    description:
      "Campaigns priced per verified view with a guaranteed view target, delivered by the DXI Market Force creator network.",
  },
  sections: [
    hero({
      eyebrow: "Product No. 03 · The distribution force",
      heading: "Viral\nEngine",
      sub: "Traditional influencer marketing charges you for the act of posting. The Viral Engine charges you for the audience that actually arrived — delivered by the DXI Market Force, our managed creator network.",
      ctas: [
        wa("Brief us a campaign", "Hello DXI, I have a launch to push with the Viral Engine."),
        anchor("See campaigns", "packages"),
      ],
    }),

    cards({
      eyebrow: "How it works",
      heading: "Pay for views, not posts",
      body: "Your campaign is priced per verified view, with a guaranteed view target agreed at briefing — delivered by a managed force of nano-influencers clipping and pushing your content across TikTok, Instagram and beyond.",
      cards: keyed([
        {
          title: "Managed end-to-end",
          body: "We recruit, brief, approve every post, verify every number, and pay every creator.",
        },
        {
          title: "Performance-paid creators",
          body: "Creators earn on verified views, not posting — so your budget follows results.",
        },
        {
          title: "The view guarantee",
          body: "Short of target? We extend at our own cost until it's delivered.",
        },
      ]),
    }),

    plates({
      sectionId: "packages",
      background: "ash",
      eyebrow: "Campaigns",
      heading: "Three ways to take over the feed",
      plates: keyed([
        {
          kicker: "CAMPAIGN / LAUNCH",
          kickerRight: "NO. 01",
          title: "Launch",
          price: { amount: "FROM ₦1M" },
          specs: ["▸ 50–60 creators", "▸ 2–3 week window", "▸ TikTok + Instagram"],
          footLabel: "MAKE IT KNOWN",
          tone: "default" as const,
        },
        {
          kicker: "CAMPAIGN / SURGE",
          kickerRight: "NO. 02",
          title: "Surge",
          price: { amount: "FROM ₦2.5M" },
          specs: ["▸ 120+ creators", "▸ 3–4 week window", "▸ Multi-platform + X"],
          footLabel: "BE EVERYWHERE",
          tone: "dark" as const,
        },
        {
          kicker: "CAMPAIGN / TAKEOVER",
          kickerRight: "NO. 03",
          title: "Takeover",
          price: { amount: "FROM ₦5M" },
          specs: ["▸ 250+ creators", "▸ 4–6 week window", "▸ All platforms + campaign manager"],
          footLabel: "OWN THE MOMENT",
          tone: "default" as const,
        },
      ]),
      band: {
        text: "Built for launches with a window: *films, music, products, campaigns.*",
        cta: wa("Brief us", "Hello DXI, I have a launch to push with the Viral Engine."),
      },
    }),

    faq({
      eyebrow: "Questions",
      heading: "Before you ask",
      items: keyed([
        {
          question: "How do I know the views are real?",
          answer:
            "Views are counted from platform-reported data on approved campaign content and cross-checked at campaign close. Fraud-flagged activity is excluded from your totals — and from creator payouts, which removes the incentive to fake it.",
        },
        {
          question: "What content do the creators post?",
          answer:
            "Content built from materials you license to the campaign — film scenes, music, product footage — shaped by a brief you sign off. Every post is approved before it goes live. Nothing is published without approval.",
        },
        {
          question: "What does a campaign cost?",
          answer:
            "Campaigns start from ₦1M. Your exact rate per view and guaranteed view target are agreed at briefing, based on the content, platforms, and timing.",
        },
        {
          question: "Is this just for entertainment?",
          answer:
            "Entertainment launches are the natural fit — a film or single lives or dies in its opening window. But any brand with a moment to win works: product drops, events, campaigns.",
        },
      ]),
    }),

    closing({
      heading: "Your launch has a window.",
      body: "Let's fill it with a force.",
      ctas: [
        wa("Brief us on WhatsApp", "Hello DXI, I have a launch to push with the Viral Engine."),
      ],
    }),
  ],
};
