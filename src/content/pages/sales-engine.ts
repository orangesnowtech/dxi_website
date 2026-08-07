import type { Page } from "@/lib/sanity/types";
import { keyed, hero, cards, plates, stats, faq, closing, wa, anchor } from "../helpers";

export const salesEngine: Page = {
  _id: "page-sales-engine",
  title: "Sales Engine",
  slug: "sales-engine",
  breadcrumb: "ENGINE NO. 01",
  seo: {
    title: "DXI Sales Engine — A Sales Funnel as a Product",
    description:
      "Ads that generate demand, an AI chatbot that closes, and e-commerce built for how Nigerians buy. Three tiers, published pricing.",
  },
  sections: [
    hero({
      eyebrow: "Product No. 01 · The revenue driver",
      heading: "Sales\nEngine",
      sub: "A complete sales funnel as a product: ads that generate demand, an AI chatbot that absorbs and qualifies it, and an e-commerce layer that closes it. Built once. Selling always.",
      ctas: [
        wa("Start with a brief", "Hello DXI, I'm interested in the Sales Engine."),
        anchor("See the tiers", "tiers"),
      ],
    }),

    cards({
      eyebrow: "The problem it solves",
      heading: "Leads are easy. Sales are the hard part.",
      body: "Most businesses can buy attention. What breaks is everything after the click: enquiries pile up, staff drown, follow-up dies, and money leaks between the ad and the sale. The Sales Engine closes that gap with a system, not more staff.",
      cards: keyed([
        {
          title: "Ads that sell",
          body: "Blunt, direct-response campaigns built to generate conversations, not impressions.",
        },
        {
          title: "A chatbot that closes",
          body: "Our AI answers, qualifies, invoices, confirms payments, and upsells — 24/7, without breaking your team.",
        },
        {
          title: "A store that converts",
          body: "E-commerce built for how Nigerians actually buy: WhatsApp-first, payment-flexible, installment-ready.",
        },
      ]),
    }),

    plates({
      sectionId: "tiers",
      background: "ash",
      eyebrow: "Pricing",
      heading: "Pick your engine",
      body: "Three tiers, published. One-off build, then a monthly that covers management and your always-on AI chatbot.",
      plates: keyed([
        {
          kicker: "TIER / STARTER",
          kickerRight: "NO. 01",
          title: "Prove Demand",
          price: { amount: "₦1.5M", unit: "BUILD", recurringAmount: "₦600K/MO" },
          specs: [
            "▸ Conversion landing page",
            "▸ WhatsApp AI chatbot — answers & qualifies",
            "▸ Direct-response ad campaigns",
          ],
          footLabel: "THE FIRST FUNNEL",
          tone: "default" as const,
        },
        {
          kicker: "TIER / STANDARD",
          kickerRight: "NO. 02",
          title: "Build the Engine",
          price: { amount: "₦3M", unit: "BUILD", recurringAmount: "₦1.2M/MO" },
          specs: [
            "▸ Full e-commerce website",
            "▸ Chatbot that closes, invoices & upsells",
            "▸ Multi-platform campaigns + WhatsApp ads",
          ],
          footLabel: "THE FLAGSHIP",
          tone: "dark" as const,
        },
        {
          kicker: "TIER / SCALE",
          kickerRight: "NO. 03",
          title: "Own the Market",
          price: { amount: "₦5M", unit: "BUILD", recurringAmount: "₦2.3M/MO" },
          specs: [
            "▸ Multi-line e-commerce",
            "▸ Chatbot + broadcast CRM — sells & re-sells",
            "▸ All platforms + creator distribution",
          ],
          footLabel: "THE FULL MACHINE",
          tone: "default" as const,
        },
      ]),
      band: {
        text: "Starter's chatbot answers. Standard's sells. *Scale's sells and brings customers back.*",
        cta: wa("Which tier fits me?", "Hello DXI, which Sales Engine tier fits my business?"),
      },
    }),

    stats({
      eyebrow: "Proof, not promises",
      heading: "Proof: the engine, running live",
      body: "A Lagos electronics retailer on the full Sales Engine — named on request in conversation.",
      stats: keyed([
        {
          value: "₦81",
          label: "COST PER QUALIFIED LEAD",
          detail: "direct-response campaigns for trusted phone brands",
        },
        {
          value: "450+",
          label: "SALES CONVERSATIONS",
          detail: "absorbed by the chatbot within days of launch",
        },
        {
          value: "48HRS",
          label: "TO 300+ INBOUND MESSAGES",
          detail: "demand proved — then we built the capacity to hold it",
        },
      ]),
    }),

    faq({
      eyebrow: "Questions",
      heading: "Before you ask",
      items: keyed([
        {
          question: "What does the monthly fee cover?",
          answer:
            "Campaign management, creative refresh, account management, reporting, and your AI chatbot subscription — the always-on sales channel. Ad spend is separate, funded by you, and paid directly to the platforms.",
        },
        {
          question: "Do I own the website?",
          answer:
            "Yes — your website, domain, content, and ad accounts are yours, including if you leave. The chatbot runs on the DXI platform under subscription, like any software you subscribe to.",
        },
        {
          question: "How fast can we launch?",
          answer:
            "It depends on the tier and your inputs (products, brand assets, approvals). We agree the timeline in writing at the blueprint stage before anything is built.",
        },
        {
          question: "Do you guarantee results?",
          answer:
            "We agree targets and review them with you monthly — and our case studies are real. But nobody can honestly guarantee advertising outcomes, and we won't pretend to. We'd rather show you the numbers.",
        },
      ]),
    }),

    closing({
      heading: "Ready to stop leaking sales?",
      body: "Tell us about your business. We'll tell you which tier fits — honestly.",
      ctas: [wa("Chat on WhatsApp", "Hello DXI, I'm interested in the Sales Engine.")],
    }),
  ],
};
