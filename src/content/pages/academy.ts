import type { Page } from "@/lib/sanity/types";
import {
  key,
  keyed,
  hero,
  cards,
  courseGrid,
  webinarGrid,
  steps,
  faq,
  richText,
  closing,
  wa,
  anchor,
  toPath,
  staticCta,
} from "../helpers";

/** The Academy partner note — the one piece of copy on the site with a link inside a paragraph. */
const partnerCopy = [
  {
    _key: key(),
    _type: "block",
    style: "normal",
    markDefs: [
      {
        _key: "partnerLink",
        _type: "link",
        href: "https://wa.me/2348074533441?text=Hello%20DXI%2C%20we%27re%20an%20institution%20interested%20in%20partnering%20with%20the%20Academy.",
      },
    ],
    children: [
      {
        _key: key(),
        _type: "span",
        marks: [],
        text: "The Academy works alongside MSME lenders and institutional partners who finance and support qualified members. Our partner network is being announced soon — if you're an institution that wants to be part of it, ",
      },
      { _key: key(), _type: "span", marks: ["partnerLink"], text: "talk to us" },
      { _key: key(), _type: "span", marks: [], text: "." },
    ],
  },
];

export const academy: Page = {
  _id: "page-academy",
  title: "Academy",
  slug: "academy",
  breadcrumb: "ACADEMY",
  seo: {
    title: "DXI Academy — Become the Business Lenders Say Yes To",
    description:
      "A working membership for founders: structuring, mentorship, marketing support, and introductions to MSME financing partners. ₦50,000/year.",
  },
  sections: [
    hero({
      tone: "light",
      eyebrow: "Product No. 02 · The starting point",
      heading: "DXI\nAcademy",
      sub: "Lenders in Nigeria are actively looking for businesses to finance — and most businesses aren't ready to be found. The Academy fixes that.",
      ctas: [anchor("Get started", "start", "signal"), anchor("What you get", "gifts", "line")],
    }),

    cards({
      sectionId: "gifts",
      background: "ash",
      eyebrow: "What membership gives you",
      heading: "Three gifts, one community",
      cards: keyed([
        {
          title: "We get you ready",
          body: "Structuring, records, registration, pricing — plus mentorship from business leaders and consultants convened by DXI. The things that make a lender take you seriously.",
        },
        {
          title: "We help you sell",
          body: "Financiers want to see cashflow — so the DXI team works on your marketing with you and helps you drive real sales. Not theory. The same work we do for paying clients.",
        },
        {
          title: "We introduce you",
          body: "When you're ready, we put you directly in front of MSME finance partners actively searching for businesses like yours. The decision is always the lender's — our job is making you the business they say yes to.",
        },
      ]),
      band: {
        text: "Membership: *₦50,000 / year.* Deliberately affordable. Deliberately demanding.",
        cta: wa("Register interest", "Hello DXI, I want to join the Academy."),
      },
    }),

    cards({
      sectionId: "start",
      columns: 2,
      eyebrow: "Get started",
      heading: "Two steps to join",
      body: "Membership opens the moment both are done. No waiting list, no interview — just the work.",
      cards: keyed([
        {
          step: "01",
          title: "Tell us your business",
          body: "Complete your business profile — it's how we understand where you are, what you sell, and the support you need first. It's also what lets us match you to the right help and, in time, the right lender. Takes about ten minutes.",
          tone: "light" as const,
          emphasis: true,
          showTick: false,
          cta: toPath("Fill your business profile", "/business-profile"),
        },
        {
          step: "02",
          title: "Pay your membership",
          body: "Right after you submit your profile, you'll receive your membership payment details — ₦50,000 for the year. Once it's settled, you're in: your community, your mentors, your member rates, all live.",
          tone: "dark" as const,
          emphasis: true,
          showTick: false,
          cta: staticCta("Sent after your profile"),
        },
      ]),
      band: {
        text: "One profile, one payment, one year of being taken seriously — *₦50,000.*",
        cta: toPath("Start now", "/business-profile"),
      },
    }),

    // Courses and webinars stay empty until there is real content — both
    // sections hide themselves rather than showing placeholder cards.
    courseGrid({
      sectionId: "courses",
      background: "ash",
      eyebrow: "On-demand courses",
      heading: "Learn at your pace",
      body: "Practical, no-fluff lessons for building a real business. Some are open to everyone; the full library is members-only.",
      courses: [],
    }),

    webinarGrid({
      sectionId: "webinars",
      eyebrow: "Webinars & live sessions",
      heading: "Learn with us, live",
      body: "Live workshops and Q&As with the DXI team and guests. Some open to all; some reserved for members.",
      webinars: [],
    }),

    steps({
      eyebrow: "The journey",
      heading: "From member to machine",
      steps: keyed([
        {
          title: "Enrol",
          body: "Join, complete your business profile, meet your cohort and accountability group.",
        },
        {
          title: "Structure",
          body: "Records, registration, positioning, pricing — the fundamentals partners look for.",
        },
        {
          title: "Grow",
          body: "Build your marketing engine with DXI guidance and member rates on execution.",
        },
        {
          title: "Get ready",
          body: "Complete the financing-readiness track and get introduced when you qualify.",
        },
        {
          title: "Graduate",
          body: "Proven members move into the Sales Engine with their Academy history counting for them.",
        },
      ]),
    }),

    faq({
      background: "ash",
      eyebrow: "Questions",
      heading: "Asked honestly, answered honestly",
      items: keyed([
        {
          question: "Will the Academy get me a loan?",
          answer:
            "No one can honestly promise you a loan — the decision always belongs to the lender. What the Academy does is make your business the kind lenders say yes to, and introduce you to partners who are genuinely looking. That's a real edge; it's just not a guarantee, and anyone who guarantees you one is lying.",
        },
        {
          question: "Who is the Academy for?",
          answer:
            "Registered or registering early-stage businesses that are ready to work. It is not for idea-stage tourists — members are held to participation standards, and inactive members are not renewed.",
        },
        {
          question: "What does it cost after the first year?",
          answer:
            "Membership renews at the standard annual rate. Members in good standing keep their community, their mentors, and their member rates on DXI services.",
        },
        {
          question: "I run an institution. Can we partner?",
          answer:
            "Yes — MSME lenders and institutions partner with the Academy on qualified pipelines and co-branded cohorts. Message us and ask for the partner brief.",
        },
      ]),
    }),

    richText({
      background: "ash",
      eyebrow: "Partners",
      heading: "Built with institutions that back businesses",
      content: partnerCopy,
    }),

    closing({
      heading: "Take your business seriously.",
      body: "Join a community of builders — backed by a full marketing agency.",
      ctas: [wa("Join via WhatsApp", "Hello DXI, I want to join the Academy.")],
    }),
  ],
};
