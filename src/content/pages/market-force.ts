import type { Page } from "@/lib/sanity/types";
import { keyed, hero, cards, closing, wa, anchor } from "../helpers";

export const marketForce: Page = {
  _id: "page-market-force",
  title: "Market Force",
  slug: "market-force",
  breadcrumb: "THE NETWORK",
  seo: {
    title: "DXI Market Force — The Network Behind The Engines",
    description:
      "A managed, ranked network of creators, clippers and writers — briefed by DXI, approved by DXI, and paid on verified performance.",
  },
  sections: [
    hero({
      eyebrow: "The network behind the engines",
      heading: "Market\nForce",
      sub: "Campaigns don't deliver themselves. Behind every DXI Viral and PR campaign is a managed, ranked network of creators, clippers, and writers — briefed by DXI, approved by DXI, and paid on verified performance. This is the Force.",
      ctas: [anchor("Join the Force", "join", "signal"), anchor("For clients", "clients")],
    }),

    cards({
      sectionId: "clients",
      eyebrow: "For clients",
      heading: "Why the Force matters to your campaign",
      body: "You never buy the Market Force directly — you buy a Viral or PR Engine campaign, and the Force delivers it. What it guarantees you:",
      cards: keyed([
        {
          title: "Approved, always",
          body: "Every clip and every article passes DXI approval before it goes live. Your brand never travels in content you haven't seen.",
        },
        {
          title: "Paid on proof",
          body: "Members earn on verified views and live-checked placements — not on posting. Faking numbers costs them their place. Your budget follows real results.",
          tone: "dark" as const,
        },
        {
          title: "Ranked, and rising",
          body: "Every campaign ranks the bench. Top performers get selected first and earn more — so the Force delivering your campaign is always its current best.",
        },
      ]),
    }),

    cards({
      sectionId: "tracks",
      background: "ash",
      columns: 2,
      eyebrow: "Two tracks",
      heading: "Creators clip. Writers tell.",
      cards: keyed([
        {
          title: "Clippers & creators",
          body: "You receive licensed campaign content — film scenes, music, product footage — and a clear brief. You clip, caption, and push it on your TikTok, Instagram, or X. Every approved post earns a base; verified views earn more. The better you perform, the earlier you're picked and the more you earn.",
          tone: "light" as const,
        },
        {
          title: "Writers",
          body: "You receive a media kit — facts, angles, approved quotes — and develop a real story in your own voice for your platform. Every piece passes DXI approval, publishes with the proper label, and pays a flat fee once it's live-checked. Moonlighting from a bigger desk? Your platform is welcome here.",
          tone: "dark" as const,
        },
      ]),
      band: {
        text: "Exact rates are shared at onboarding — *and payment lands on verification, every time.*",
        cta: anchor("Join the Force", "join", "signal"),
      },
    }),

    cards({
      columns: 2,
      eyebrow: "The deal",
      heading: "How the Force works",
      cards: keyed([
        {
          title: "What DXI brings",
          body: "Licensed content and clean briefs · approval that protects you legally · verified counting you can trust · payment on proof, on time · a ranking that rewards your work with more work.",
        },
        {
          title: "What we ask",
          body: "Post only what's approved · disclose what's sponsored · hit your briefs and windows · real numbers only — fraud ends membership, permanently · represent the campaign like it's yours, because it is.",
        },
      ]),
    }),

    closing({
      sectionId: "join",
      heading: "Join the founding bench.",
      body: "Send us your handle or platform, links to your three best pieces, and which track you're joining — clipper or writer. We review, we onboard, you get your first brief.",
      ctas: [wa("Apply on WhatsApp", "Hello DXI, I want to join the Market Force. My track: ")],
    }),
  ],
};
