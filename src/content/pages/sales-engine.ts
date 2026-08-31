import type { Page } from "@/lib/sanity/types";
import {
  keyed,
  hero,
  cards,
  features,
  plates,
  stats,
  faq,
  closing,
  wa,
  anchor,
} from "../helpers";

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

    features({
      eyebrow: "What's inside the engine",
      heading: "One system. Every part of the sale.",
      body: "The Sales Engine isn't one tool — it's the whole path from stranger to paying customer, built as one machine. Here's what runs inside it, and what unlocks as you scale.",
      caption: "Every tier includes everything to its left. Open any row for the detail.",
      features: keyed([
        {
          title: "Unified Communications",
          lede: "One inbox for every channel",
          tier: "starter" as const,
          body: "Your customers message you everywhere — WhatsApp, Instagram, Facebook, your website. The Sales Engine pulls all of it into one place. One inbox, one conversation history per customer, no matter how they reached you. Nothing gets missed because it landed on the wrong app, and your team stops switching between five screens to answer one question.",
          points: keyed([
            {
              text: "WhatsApp, Facebook Messenger, Instagram DM and website chat — all in one inbox",
              tier: "starter" as const,
            },
            { text: "One unified history per customer, across every channel", tier: "starter" as const },
            { text: "Never lose a message to the wrong platform again", tier: "starter" as const },
          ]),
        },
        {
          title: "The AI Chatbot",
          lede: "Answers, qualifies and sells 24/7",
          tier: "starter" as const,
          body: "The engine's core. Our AI answers the moment a customer messages — 2am, Sunday, public holiday — and never makes them wait till morning. It handles the repetitive questions, separates serious buyers from browsers, and hands the ready-to-pay ones to your team. Every enquiry it touches becomes a contact you keep.",
          points: keyed([
            { text: "Instant replies, 24/7, on every channel", tier: "starter" as const },
            {
              text: "Answers common questions automatically — price, stock, delivery, location",
              tier: "starter" as const,
            },
            { text: "Qualifies buyers before your team spends a minute on them", tier: "starter" as const },
            {
              text: "Quotes, invoices, confirms payment and upsells inside the chat",
              tier: "standard" as const,
            },
            { text: "Smooth handoff to a human when the conversation needs one", tier: "starter" as const },
          ]),
        },
        {
          title: "Multi-User Access",
          lede: "Your whole team, one system",
          tier: "standard" as const,
          body: "One person can't hold a growing sales operation. The Sales Engine lets your whole team work the same inbox without stepping on each other — assign conversations, set who can see and do what, and know exactly who handled which customer.",
          points: keyed([
            { text: "Multiple team members in the same inbox", tier: "standard" as const },
            { text: "Roles and permissions — control who sees and does what", tier: "standard" as const },
            { text: "Assign conversations to specific staff", tier: "standard" as const },
            { text: "Full accountability — see who replied to whom", tier: "standard" as const },
          ]),
        },
        {
          title: "Lead Capture & CRM",
          lede: "Every enquiry becomes an asset",
          tier: "starter" as const,
          body: "A walk-in who leaves, leaves nothing. Every conversation through the Sales Engine becomes a saved customer record — contact details, what they asked, what they bought, when. Your customer list stops living in one person's phone and becomes an asset the business owns.",
          points: keyed([
            { text: "Every conversation saved as a customer record", tier: "starter" as const },
            { text: "Contact details captured automatically", tier: "starter" as const },
            { text: "Full history per customer — asked, bought, when", tier: "standard" as const },
            { text: "Tag and segment customers: new, repeat, high-value, cold", tier: "scale" as const },
          ]),
        },
        {
          title: "Advertising That Starts Conversations",
          tier: "starter" as const,
          body: "Likes don't pay salaries. Our ads are built to start conversations and drive sales, not collect vanity metrics. And they don't stop at the first click — we follow up with the people who showed interest and didn't buy, and find new people who look like your best customers.",
          points: keyed([
            {
              text: "Direct-response ads on Meta and Google, built to drive chats",
              tier: "starter" as const,
            },
            {
              text: "Retargeting — follow up with people who clicked or messaged but didn't buy",
              tier: "standard" as const,
            },
            {
              text: "Lookalike audiences — find new people like your best customers",
              tier: "scale" as const,
            },
            { text: "Full tracking and pixel setup so every naira is measurable", tier: "starter" as const },
          ]),
        },
        {
          title: "The Store",
          lede: "Built to convert",
          tier: "starter" as const,
          body: "A storefront built for how your customers actually buy: mobile-first, WhatsApp-first, payment-flexible. Your catalogue with prices and images, a checkout that works, and a chat button on every page that feeds straight back into your unified inbox.",
          points: keyed([
            { text: "Conversion-built landing page or storefront", tier: "starter" as const },
            { text: "Full product catalogue — prices, images, descriptions", tier: "standard" as const },
            { text: "Multi-line e-commerce for a bigger range", tier: "scale" as const },
            { text: "Mobile-first, chat-connected on every page", tier: "starter" as const },
          ]),
        },
        {
          title: "Payments & Commerce",
          tier: "standard" as const,
          body: "From “how much?” to “payment confirmed” without leaving the conversation. The engine quotes, invoices and takes payment in-chat and on-site, through the rails your customers already use.",
          points: keyed([
            { text: "In-chat and on-site payment — quote, invoice, confirm", tier: "standard" as const },
            { text: "Order tracking and confirmation", tier: "standard" as const },
            { text: "Local payment rails, installment-ready", tier: "standard" as const },
          ]),
        },
        {
          title: "Retention & Re-Engagement",
          lede: "Bring buyers back",
          tier: "scale" as const,
          body: "You fought to win a customer once. The Scale engine makes sure you speak to them again. When new stock lands or an offer drops, reach every past buyer at once — and let automated follow-ups do the reminding your team forgets to.",
          points: keyed([
            {
              text: "Broadcast campaigns — message past customers when stock or offers drop",
              tier: "scale" as const,
            },
            { text: "Automated follow-ups — post-purchase, abandoned enquiries", tier: "scale" as const },
            { text: "Segmented messaging — right message, right customer group", tier: "scale" as const },
          ]),
        },
        {
          title: "Automation & Workflows",
          tier: "standard" as const,
          body: "The engine does the remembering. Instant acknowledgements, rules that route each conversation to the right place, and follow-up triggers so nothing slips through while your team sleeps.",
          points: keyed([
            { text: "Auto-replies and instant acknowledgements", tier: "starter" as const },
            { text: "Routing rules — right conversation, right person", tier: "standard" as const },
            { text: "Follow-up reminders and triggers", tier: "scale" as const },
          ]),
        },
        {
          title: "Reporting & Analytics",
          lede: "See everything",
          tier: "standard" as const,
          body: "“The ads are working, I think” is not a report. The Sales Engine shows you exactly what's happening: enquiries, response times, conversions, what a customer costs, what they're worth, and which channel brings your best buyers — in one dashboard, with a monthly summary you can actually act on.",
          points: keyed([
            { text: "Core dashboard — enquiries, response times, conversions", tier: "standard" as const },
            { text: "Cost per lead and customer value", tier: "standard" as const },
            {
              text: "Channel performance — which platform brings the best buyers",
              tier: "standard" as const,
            },
            { text: "Advanced analytics and monthly strategy report", tier: "scale" as const },
          ]),
        },
        {
          title: "Managed by DXI",
          lede: "You run your business, we run the engine",
          tier: "starter" as const,
          body: "You didn't start your business to become a marketer. Every tier is managed by DXI — setup, daily optimisation, ad management, creative testing and continuous chatbot tuning. A team accountable for the numbers, not just a tool you're handed and left to figure out.",
          points: keyed([
            { text: "Full setup, optimisation and daily management", tier: "starter" as const },
            { text: "Ad management and creative testing", tier: "starter" as const },
            { text: "Ongoing chatbot tuning", tier: "starter" as const },
            { text: "A dedicated strategist and weekly optimisation", tier: "scale" as const },
          ]),
        },
      ]),
      band: {
        text: "Starter proves demand. Standard builds the engine that closes it. *Scale brings the customers back.*",
      },
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
