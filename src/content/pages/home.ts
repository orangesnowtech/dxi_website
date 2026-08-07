import type { Page } from "@/lib/sanity/types";
import { keyed, hero, intro, plates, cards, stats, steps, closing, wa, anchor, toPage, tel } from "../helpers";

export const home: Page = {
  _id: "page-home",
  title: "Home",
  slug: "home",
  seo: {
    title: "DXI Marketing — Grow Like It's a System.",
    description:
      "A Lagos growth agency that finds your customers, talks to them, and closes them — run as a machine you can measure. Four engines, one academy.",
  },
  sections: [
    hero({
      eyebrow: "Digital eXperiences · Integrated Marketing",
      heading: "Grow like\nit's a system",
      sub: "Because now it is. DXI is a Lagos growth agency that finds your customers, talks to them, and closes them — run as a machine you can measure, not luck you hope repeats.",
      showLowerNotch: true,
      ctas: [
        wa("Grow my business", "Hello DXI, I'd like to talk about growing my business."),
        anchor("See how it works", "how"),
      ],
    }),

    intro({
      sectionId: "how",
      eyebrow: "Why we grow businesses others can't",
      heading: "Most agencies improvise. We built a machine.",
      body: "Growth stops being luck when it runs on a system. So we turned the work every business needs — finding customers, talking to them, closing them, spreading the word — into four engines that run every day, managed by our in-house team. You don't buy hours and hope. You plug into a machine and watch the numbers.",
    }),

    plates({
      sectionId: "products",
      background: "ash",
      columns: 2,
      eyebrow: "The four engines",
      heading: "Find the growth you're missing",
      body: "Each engine solves one growth problem, runs on its own, and plugs into the rest. Start where your business needs it most.",
      plates: keyed([
        {
          kicker: "ENGINE NO. 01",
          kickerRight: "DXI",
          title: "Sales Engine",
          role: "THE REVENUE DRIVER",
          description:
            "A complete sales funnel: direct-response ads, an AI chatbot that closes, and e-commerce built for how Nigerians buy.",
          specs: [
            "DOES *ADS + CHATBOT + STORE*",
            "RUNS *24/7, MANAGED BY DXI*",
            "FOR *BUSINESSES READY TO SCALE*",
          ],
          footLabel: "START HERE",
          tone: "lead" as const,
          link: toPage("Sales Engine", "sales-engine"),
        },
        {
          kicker: "ENGINE NO. 02",
          kickerRight: "DXI",
          title: "Content Engine",
          role: "THE STUDIO",
          description:
            "A full production house: design, video, photography, live streaming and audio — inside every engine, or booked on its own.",
          specs: [
            "DEPTS *DESIGN / VIDEO / AUDIO*",
            "COVERS *LAUNCHES, EVENTS, SEASONS*",
            "FOR *BRANDS THAT SHIP CONTENT*",
          ],
          footLabel: "VIEW ENGINE",
          tone: "default" as const,
          link: toPage("Content Engine", "content"),
        },
        {
          kicker: "ENGINE NO. 03",
          kickerRight: "DXI",
          title: "Viral Engine",
          role: "THE DISTRIBUTION FORCE",
          description:
            "Campaigns priced in verified views — clips pushed everywhere by the DXI Market Force creator network.",
          specs: [
            "PAYS FOR *VERIFIED VIEWS, NOT POSTS*",
            "CREATORS *50 TO 250+ PER CAMPAIGN*",
            "FOR *LAUNCHES WITH A WINDOW*",
          ],
          footLabel: "VIEW ENGINE",
          tone: "default" as const,
          link: toPage("Viral Engine", "viral-engine"),
        },
        {
          kicker: "ENGINE NO. 04",
          kickerRight: "DXI",
          title: "PR Engine",
          role: "THE CREDIBILITY ENGINE",
          description:
            "Real stories developed by real writers, published on real platforms — every placement a live URL you can check.",
          specs: [
            "DELIVERS *VERIFIED PLACEMENTS*",
            "WRITTEN BY *THE MARKET FORCE BENCH*",
            "FOR *NEWS WORTH SPREADING*",
          ],
          footLabel: "VIEW ENGINE",
          tone: "default" as const,
          link: toPage("PR Engine", "pr-engine"),
        },
      ]),
    }),

    cards({
      background: "ash",
      columns: 2,
      eyebrow: "Beyond the engines",
      heading: "One academy. One force.",
      body: "Engines are bought. The Academy is joined. The Market Force delivers.",
      cards: keyed([
        {
          eyebrow: "Joined, not bought",
          title: "DXI Academy",
          body: "The membership, not a machine: early-stage businesses get structured, get financeable, and grow into engine clients — ₦50,000 a year.",
          tone: "light" as const,
          emphasis: true,
          showTick: false,
          cta: toPage("Join the Academy", "academy", "line"),
        },
        {
          eyebrow: "The delivery network",
          title: "The Market Force",
          body: "Not for sale — it delivers: every Viral and PR campaign runs on our managed, ranked network of creators and writers.",
          tone: "dark" as const,
          emphasis: true,
          showTick: false,
          cta: toPage("Meet the Force", "market-force"),
        },
      ]),
    }),

    stats({
      eyebrow: "Proof, not promises",
      heading: "A Lagos electronics retailer",
      body: "A Lagos electronics retailer on the full Sales Engine — direct-response ads, AI chatbot, e-commerce.",
      stats: keyed([
        {
          value: "₦81",
          label: "COST PER QUALIFIED LEAD",
          detail: "on blunt, direct-response campaigns for trusted phone brands",
        },
        {
          value: "450+",
          label: "SALES CONVERSATIONS",
          detail: "absorbed by the AI chatbot within days of launch",
        },
        {
          value: "48HRS",
          label: "TO 300+ INBOUND MESSAGES",
          detail: "the campaign that proved demand — then we built the capacity to hold it",
        },
      ]),
    }),

    steps({
      background: "ash",
      eyebrow: "How we work",
      heading: "Five steps. No mystery.",
      steps: keyed([
        {
          title: "Brief",
          body: "You tell us the business and the goal. We tell you which product fits — honestly.",
        },
        {
          title: "Blueprint",
          body: "Scope, timeline, and targets agreed in writing before anything is built.",
        },
        {
          title: "Build",
          body: "Built in-house on a delivery checklist, reviewed with you at each gate.",
        },
        {
          title: "Launch",
          body: "Campaigns live. Chatbot answering. Numbers arriving in your report.",
        },
        {
          title: "Optimise",
          body: "Monthly reviews against targets. What works gets fuel. What doesn't gets fixed.",
        },
      ]),
    }),

    closing({
      heading: "Let's build your growth machine.",
      body: "Start with one engine. Grow into the machine.",
      ctas: [
        wa("Chat on WhatsApp", "Hello DXI, I'd like to talk about growing my business."),
        tel("Call 0807 453 3441"),
      ],
    }),
  ],
};
