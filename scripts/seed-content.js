/**
 * Seeds the new site's content into Sanity.
 *
 * Ports all seven pages from the design export into `page` documents plus the
 * shared `siteSettings` singleton. Uses createOrReplace throughout, so running
 * it twice is safe — it overwrites the seeded documents and leaves anything
 * else in the dataset alone.
 *
 * Run with:  node scripts/seed-content.js
 * Dry run:   node scripts/seed-content.js --dry
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local, and NEXT_PUBLIC_SANITY_DATASET
 * pointed at the dataset you want to fill.
 */

try {
  require('dotenv').config({ path: '.env.local' });
} catch {
  console.warn('Note: dotenv not installed. Set environment variables manually.');
}

const { createClient } = require('@sanity/client');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ece1ws9f';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;
const dryRun = process.argv.includes('--dry');

if (!token && !dryRun) {
  console.error('Missing SANITY_API_WRITE_TOKEN. Add it to .env.local, or pass --dry.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-02',
  useCdn: false,
  token,
});

/* ── Helpers ──────────────────────────────────────────────────────────── */

let keyCounter = 0;
/** Sanity needs a stable _key on every array member. */
const key = () => `k${(keyCounter++).toString(36)}`;

/** Adds _key to each item of an array, and _type where given. */
const list = (items, type) =>
  items.map((item) => ({ _key: key(), ...(type ? { _type: type } : {}), ...item }));

const wa = (label, message, style = 'signal') => ({
  _type: 'cta',
  label,
  kind: 'whatsapp',
  message,
  style,
});

const anchor = (label, target, style = 'lineInverse') => ({
  _type: 'cta',
  label,
  kind: 'anchor',
  anchor: target,
  style,
});

const toPage = (label, slug, style = 'signal') => ({
  _type: 'cta',
  label,
  kind: 'page',
  page: { _type: 'reference', _ref: `page-${slug}` },
  style,
});

const toPath = (label, path, style = 'signal') => ({
  _type: 'cta',
  label,
  kind: 'url',
  path,
  style,
});

const tel = (label, style = 'lineInverse') => ({ _type: 'cta', label, kind: 'tel', style });

const staticCta = (label) => ({ _type: 'cta', label, kind: 'static', style: 'signal' });

const hero = (fields) => ({ _key: key(), _type: 'heroSection', tone: 'dark', ...fields });
const intro = (fields) => ({ _key: key(), _type: 'introSection', background: 'paper', ...fields });
const cards = (fields) => ({ _key: key(), _type: 'cardGrid', background: 'paper', columns: 3, ...fields });
const plates = (fields) => ({ _key: key(), _type: 'plateGrid', background: 'paper', columns: 3, ...fields });
const features = (fields) => ({ _key: key(), _type: 'featureList', background: 'paper', ...fields });
const stats = (fields) => ({ _key: key(), _type: 'statsSection', ...fields });
const steps = (fields) => ({ _key: key(), _type: 'stepsSection', background: 'paper', ...fields });
const faq = (fields) => ({ _key: key(), _type: 'faqSection', background: 'paper', ...fields });
const closing = (fields) => ({ _key: key(), _type: 'ctaSection', ...fields });

/** The proof numbers, shared by the home and Sales Engine pages. */
const PROOF_STATS = (detailPrefix) =>
  list([
    {
      value: '₦81',
      label: 'COST PER QUALIFIED LEAD',
      detail: detailPrefix.lead,
    },
    {
      value: '450+',
      label: 'SALES CONVERSATIONS',
      detail: detailPrefix.conversations,
    },
    {
      value: '48HRS',
      label: 'TO 300+ INBOUND MESSAGES',
      detail: detailPrefix.inbound,
    },
  ]);

/* ── Site settings ────────────────────────────────────────────────────── */

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  whatsappNumber: '2348074533441',
  phoneDisplay: '0807 453 3441',
  phoneDial: '+2348074533441',
  navLinks: list([
    { label: 'Home', page: { _type: 'reference', _ref: 'page-home' } },
    { label: 'Sales Engine', page: { _type: 'reference', _ref: 'page-sales-engine' } },
    { label: 'Content', page: { _type: 'reference', _ref: 'page-content' } },
    { label: 'Viral', page: { _type: 'reference', _ref: 'page-viral-engine' } },
    { label: 'PR', page: { _type: 'reference', _ref: 'page-pr-engine' } },
    { label: 'Market Force', page: { _type: 'reference', _ref: 'page-market-force' } },
    { label: 'Academy', page: { _type: 'reference', _ref: 'page-academy' } },
  ]),
  navCta: wa('WhatsApp Us', "Hello DXI, I'd like to talk."),
  footerTagline: 'DIGITAL eXPERIENCES AND INTEGRATED MARKETING · LAGOS',
  footerContact: 'DXIMARKETING.COM · 0807 453 3441',
};

/* ── Pages ────────────────────────────────────────────────────────────── */

const home = {
  _id: 'page-home',
  _type: 'page',
  title: 'Home',
  slug: { _type: 'slug', current: 'home' },
  seo: {
    title: "DXI Marketing — Grow Like It's a System.",
    description:
      'A Lagos growth agency that finds your customers, talks to them, and closes them — run as a machine you can measure. Four engines, one academy.',
  },
  sections: [
    hero({
      eyebrow: 'Digital eXperiences · Integrated Marketing',
      heading: "Grow like\nit's a system",
      sub: 'Because now it is. DXI is a Lagos growth agency that finds your customers, talks to them, and closes them — run as a machine you can measure, not luck you hope repeats.',
      showLowerNotch: true,
      ctas: [
        wa('Grow my business', "Hello DXI, I'd like to talk about growing my business."),
        anchor('See how it works', 'how'),
      ],
    }),
    intro({
      sectionId: 'how',
      eyebrow: "Why we grow businesses others can't",
      heading: 'Most agencies improvise. We built a machine.',
      body: "Growth stops being luck when it runs on a system. So we turned the work every business needs — finding customers, talking to them, closing them, spreading the word — into four engines that run every day, managed by our in-house team. You don't buy hours and hope. You plug into a machine and watch the numbers.",
    }),
    plates({
      sectionId: 'products',
      background: 'ash',
      columns: 2,
      eyebrow: 'The four engines',
      heading: "Find the growth you're missing",
      body: 'Each engine solves one growth problem, runs on its own, and plugs into the rest. Start where your business needs it most.',
      plates: list([
        {
          kicker: 'ENGINE NO. 01',
          kickerRight: 'DXI',
          title: 'Sales Engine',
          role: 'THE REVENUE DRIVER',
          description:
            'A complete sales funnel: direct-response ads, an AI chatbot that closes, and e-commerce built for how Nigerians buy.',
          specs: [
            'DOES *ADS + CHATBOT + STORE*',
            'RUNS *24/7, MANAGED BY DXI*',
            'FOR *BUSINESSES READY TO SCALE*',
          ],
          footLabel: 'START HERE',
          tone: 'lead',
          link: toPage('Sales Engine', 'sales-engine'),
        },
        {
          kicker: 'ENGINE NO. 02',
          kickerRight: 'DXI',
          title: 'Content Engine',
          role: 'THE STUDIO',
          description:
            'A full production house: design, video, photography, live streaming and audio — inside every engine, or booked on its own.',
          specs: [
            'DEPTS *DESIGN / VIDEO / AUDIO*',
            'COVERS *LAUNCHES, EVENTS, SEASONS*',
            'FOR *BRANDS THAT SHIP CONTENT*',
          ],
          footLabel: 'VIEW ENGINE',
          tone: 'default',
          link: toPage('Content Engine', 'content'),
        },
        {
          kicker: 'ENGINE NO. 03',
          kickerRight: 'DXI',
          title: 'Viral Engine',
          role: 'THE DISTRIBUTION FORCE',
          description:
            'Campaigns priced in verified views — clips pushed everywhere by the DXI Market Force creator network.',
          specs: [
            'PAYS FOR *VERIFIED VIEWS, NOT POSTS*',
            'CREATORS *50 TO 250+ PER CAMPAIGN*',
            'FOR *LAUNCHES WITH A WINDOW*',
          ],
          footLabel: 'VIEW ENGINE',
          tone: 'default',
          link: toPage('Viral Engine', 'viral-engine'),
        },
        {
          kicker: 'ENGINE NO. 04',
          kickerRight: 'DXI',
          title: 'PR Engine',
          role: 'THE CREDIBILITY ENGINE',
          description:
            'Real stories developed by real writers, published on real platforms — every placement a live URL you can check.',
          specs: [
            'DELIVERS *VERIFIED PLACEMENTS*',
            'WRITTEN BY *THE MARKET FORCE BENCH*',
            'FOR *NEWS WORTH SPREADING*',
          ],
          footLabel: 'VIEW ENGINE',
          tone: 'default',
          link: toPage('PR Engine', 'pr-engine'),
        },
      ]),
    }),
    cards({
      background: 'ash',
      columns: 2,
      eyebrow: 'Beyond the engines',
      heading: 'One academy. One force.',
      body: 'Engines are bought. The Academy is joined. The Market Force delivers.',
      cards: list([
        {
          eyebrow: 'Joined, not bought',
          title: 'DXI Academy',
          body: 'The membership, not a machine: early-stage businesses get structured, get financeable, and grow into engine clients — ₦50,000 a year.',
          tone: 'light',
          emphasis: true,
          showTick: false,
          cta: toPage('Join the Academy', 'academy', 'line'),
        },
        {
          eyebrow: 'The delivery network',
          title: 'The Market Force',
          body: 'Not for sale — it delivers: every Viral and PR campaign runs on our managed, ranked network of creators and writers.',
          tone: 'dark',
          emphasis: true,
          showTick: false,
          cta: toPage('Meet the Force', 'market-force'),
        },
      ]),
    }),
    stats({
      eyebrow: 'Proof, not promises',
      heading: 'A Lagos electronics retailer',
      body: 'A Lagos electronics retailer on the full Sales Engine — direct-response ads, AI chatbot, e-commerce.',
      stats: PROOF_STATS({
        lead: 'on blunt, direct-response campaigns for trusted phone brands',
        conversations: 'absorbed by the AI chatbot within days of launch',
        inbound: 'the campaign that proved demand — then we built the capacity to hold it',
      }),
    }),
    steps({
      background: 'ash',
      eyebrow: 'How we work',
      heading: 'Five steps. No mystery.',
      steps: list([
        {
          title: 'Brief',
          body: 'You tell us the business and the goal. We tell you which product fits — honestly.',
        },
        {
          title: 'Blueprint',
          body: 'Scope, timeline, and targets agreed in writing before anything is built.',
        },
        {
          title: 'Build',
          body: 'Built in-house on a delivery checklist, reviewed with you at each gate.',
        },
        {
          title: 'Launch',
          body: 'Campaigns live. Chatbot answering. Numbers arriving in your report.',
        },
        {
          title: 'Optimise',
          body: "Monthly reviews against targets. What works gets fuel. What doesn't gets fixed.",
        },
      ]),
    }),
    closing({
      heading: "Let's build your growth machine.",
      body: 'Start with one engine. Grow into the machine.',
      ctas: [
        wa('Chat on WhatsApp', "Hello DXI, I'd like to talk about growing my business."),
        tel('Call 0807 453 3441'),
      ],
    }),
  ],
};

const salesEngine = {
  _id: 'page-sales-engine',
  _type: 'page',
  title: 'Sales Engine',
  slug: { _type: 'slug', current: 'sales-engine' },
  breadcrumb: 'ENGINE NO. 01',
  seo: {
    title: 'DXI Sales Engine — A Sales Funnel as a Product',
    description:
      'Ads that generate demand, an AI chatbot that closes, and e-commerce built for how Nigerians buy. Three tiers, published pricing.',
  },
  sections: [
    hero({
      eyebrow: 'Product No. 01 · The revenue driver',
      heading: 'Sales\nEngine',
      sub: 'A complete sales funnel as a product: ads that generate demand, an AI chatbot that absorbs and qualifies it, and an e-commerce layer that closes it. Built once. Selling always.',
      ctas: [
        wa('Start with a brief', "Hello DXI, I'm interested in the Sales Engine."),
        anchor('See the tiers', 'tiers'),
      ],
    }),
    cards({
      eyebrow: 'The problem it solves',
      heading: 'Leads are easy. Sales are the hard part.',
      body: 'Most businesses can buy attention. What breaks is everything after the click: enquiries pile up, staff drown, follow-up dies, and money leaks between the ad and the sale. The Sales Engine closes that gap with a system, not more staff.',
      cards: list([
        {
          title: 'Ads that sell',
          body: 'Blunt, direct-response campaigns built to generate conversations, not impressions.',
        },
        {
          title: 'A chatbot that closes',
          body: 'Our AI answers, qualifies, invoices, confirms payments, and upsells — 24/7, without breaking your team.',
        },
        {
          title: 'A store that converts',
          body: 'E-commerce built for how Nigerians actually buy: WhatsApp-first, payment-flexible, installment-ready.',
        },
      ]),
    }),
    features({
      eyebrow: "What's inside the engine",
      heading: 'One system. Every part of the sale.',
      body: "The Sales Engine isn't one tool — it's the whole path from stranger to paying customer, built as one machine. Here's what runs inside it, and what unlocks as you scale.",
      caption: 'Every tier includes everything to its left. Open any row for the detail.',
      features: list([
        {
          title: 'Unified Communications',
          lede: 'One inbox for every channel',
          tier: 'starter',
          body: 'Your customers message you everywhere — WhatsApp, Instagram, Facebook, your website. The Sales Engine pulls all of it into one place. One inbox, one conversation history per customer, no matter how they reached you. Nothing gets missed because it landed on the wrong app, and your team stops switching between five screens to answer one question.',
          points: list([
            {
              text: 'WhatsApp, Facebook Messenger, Instagram DM and website chat — all in one inbox',
              tier: 'starter',
            },
            { text: 'One unified history per customer, across every channel', tier: 'starter' },
            { text: 'Never lose a message to the wrong platform again', tier: 'starter' },
          ]),
        },
        {
          title: 'The AI Chatbot',
          lede: 'Answers, qualifies and sells 24/7',
          tier: 'starter',
          body: "The engine's core. Our AI answers the moment a customer messages — 2am, Sunday, public holiday — and never makes them wait till morning. It handles the repetitive questions, separates serious buyers from browsers, and hands the ready-to-pay ones to your team. Every enquiry it touches becomes a contact you keep.",
          points: list([
            { text: 'Instant replies, 24/7, on every channel', tier: 'starter' },
            {
              text: 'Answers common questions automatically — price, stock, delivery, location',
              tier: 'starter',
            },
            { text: 'Qualifies buyers before your team spends a minute on them', tier: 'starter' },
            {
              text: 'Quotes, invoices, confirms payment and upsells inside the chat',
              tier: 'standard',
            },
            { text: 'Smooth handoff to a human when the conversation needs one', tier: 'starter' },
          ]),
        },
        {
          title: 'Multi-User Access',
          lede: 'Your whole team, one system',
          tier: 'standard',
          body: "One person can't hold a growing sales operation. The Sales Engine lets your whole team work the same inbox without stepping on each other — assign conversations, set who can see and do what, and know exactly who handled which customer.",
          points: list([
            { text: 'Multiple team members in the same inbox', tier: 'standard' },
            { text: 'Roles and permissions — control who sees and does what', tier: 'standard' },
            { text: 'Assign conversations to specific staff', tier: 'standard' },
            { text: 'Full accountability — see who replied to whom', tier: 'standard' },
          ]),
        },
        {
          title: 'Lead Capture & CRM',
          lede: 'Every enquiry becomes an asset',
          tier: 'starter',
          body: "A walk-in who leaves, leaves nothing. Every conversation through the Sales Engine becomes a saved customer record — contact details, what they asked, what they bought, when. Your customer list stops living in one person's phone and becomes an asset the business owns.",
          points: list([
            { text: 'Every conversation saved as a customer record', tier: 'starter' },
            { text: 'Contact details captured automatically', tier: 'starter' },
            { text: 'Full history per customer — asked, bought, when', tier: 'standard' },
            { text: 'Tag and segment customers: new, repeat, high-value, cold', tier: 'scale' },
          ]),
        },
        {
          title: 'Advertising That Starts Conversations',
          tier: 'starter',
          body: "Likes don't pay salaries. Our ads are built to start conversations and drive sales, not collect vanity metrics. And they don't stop at the first click — we follow up with the people who showed interest and didn't buy, and find new people who look like your best customers.",
          points: list([
            {
              text: 'Direct-response ads on Meta and Google, built to drive chats',
              tier: 'starter',
            },
            {
              text: "Retargeting — follow up with people who clicked or messaged but didn't buy",
              tier: 'standard',
            },
            {
              text: 'Lookalike audiences — find new people like your best customers',
              tier: 'scale',
            },
            { text: 'Full tracking and pixel setup so every naira is measurable', tier: 'starter' },
          ]),
        },
        {
          title: 'The Store',
          lede: 'Built to convert',
          tier: 'starter',
          body: 'A storefront built for how your customers actually buy: mobile-first, WhatsApp-first, payment-flexible. Your catalogue with prices and images, a checkout that works, and a chat button on every page that feeds straight back into your unified inbox.',
          points: list([
            { text: 'Conversion-built landing page or storefront', tier: 'starter' },
            { text: 'Full product catalogue — prices, images, descriptions', tier: 'standard' },
            { text: 'Multi-line e-commerce for a bigger range', tier: 'scale' },
            { text: 'Mobile-first, chat-connected on every page', tier: 'starter' },
          ]),
        },
        {
          title: 'Payments & Commerce',
          tier: 'standard',
          body: 'From “how much?” to “payment confirmed” without leaving the conversation. The engine quotes, invoices and takes payment in-chat and on-site, through the rails your customers already use.',
          points: list([
            { text: 'In-chat and on-site payment — quote, invoice, confirm', tier: 'standard' },
            { text: 'Order tracking and confirmation', tier: 'standard' },
            { text: 'Local payment rails, installment-ready', tier: 'standard' },
          ]),
        },
        {
          title: 'Retention & Re-Engagement',
          lede: 'Bring buyers back',
          tier: 'scale',
          body: 'You fought to win a customer once. The Scale engine makes sure you speak to them again. When new stock lands or an offer drops, reach every past buyer at once — and let automated follow-ups do the reminding your team forgets to.',
          points: list([
            {
              text: 'Broadcast campaigns — message past customers when stock or offers drop',
              tier: 'scale',
            },
            { text: 'Automated follow-ups — post-purchase, abandoned enquiries', tier: 'scale' },
            { text: 'Segmented messaging — right message, right customer group', tier: 'scale' },
          ]),
        },
        {
          title: 'Automation & Workflows',
          tier: 'standard',
          body: 'The engine does the remembering. Instant acknowledgements, rules that route each conversation to the right place, and follow-up triggers so nothing slips through while your team sleeps.',
          points: list([
            { text: 'Auto-replies and instant acknowledgements', tier: 'starter' },
            { text: 'Routing rules — right conversation, right person', tier: 'standard' },
            { text: 'Follow-up reminders and triggers', tier: 'scale' },
          ]),
        },
        {
          title: 'Reporting & Analytics',
          lede: 'See everything',
          tier: 'standard',
          body: "“The ads are working, I think” is not a report. The Sales Engine shows you exactly what's happening: enquiries, response times, conversions, what a customer costs, what they're worth, and which channel brings your best buyers — in one dashboard, with a monthly summary you can actually act on.",
          points: list([
            { text: 'Core dashboard — enquiries, response times, conversions', tier: 'standard' },
            { text: 'Cost per lead and customer value', tier: 'standard' },
            {
              text: 'Channel performance — which platform brings the best buyers',
              tier: 'standard',
            },
            { text: 'Advanced analytics and monthly strategy report', tier: 'scale' },
          ]),
        },
        {
          title: 'Managed by DXI',
          lede: 'You run your business, we run the engine',
          tier: 'starter',
          body: "You didn't start your business to become a marketer. Every tier is managed by DXI — setup, daily optimisation, ad management, creative testing and continuous chatbot tuning. A team accountable for the numbers, not just a tool you're handed and left to figure out.",
          points: list([
            { text: 'Full setup, optimisation and daily management', tier: 'starter' },
            { text: 'Ad management and creative testing', tier: 'starter' },
            { text: 'Ongoing chatbot tuning', tier: 'starter' },
            { text: 'A dedicated strategist and weekly optimisation', tier: 'scale' },
          ]),
        },
      ]),
      band: {
        text: 'Starter proves demand. Standard builds the engine that closes it. *Scale brings the customers back.*',
      },
    }),

    plates({
      sectionId: 'tiers',
      background: 'ash',
      eyebrow: 'Pricing',
      heading: 'Pick your engine',
      body: 'Three tiers, published. One-off build, then a monthly that covers management and your always-on AI chatbot.',
      plates: list([
        {
          kicker: 'TIER / STARTER',
          kickerRight: 'NO. 01',
          title: 'Prove Demand',
          price: { amount: '₦1.5M', unit: 'BUILD', recurringAmount: '₦600K/MO' },
          specs: [
            '▸ Conversion landing page',
            '▸ WhatsApp AI chatbot — answers & qualifies',
            '▸ Direct-response ad campaigns',
          ],
          footLabel: 'THE FIRST FUNNEL',
          tone: 'default',
        },
        {
          kicker: 'TIER / STANDARD',
          kickerRight: 'NO. 02',
          title: 'Build the Engine',
          price: { amount: '₦3M', unit: 'BUILD', recurringAmount: '₦1.2M/MO' },
          specs: [
            '▸ Full e-commerce website',
            '▸ Chatbot that closes, invoices & upsells',
            '▸ Multi-platform campaigns + WhatsApp ads',
          ],
          footLabel: 'THE FLAGSHIP',
          tone: 'dark',
        },
        {
          kicker: 'TIER / SCALE',
          kickerRight: 'NO. 03',
          title: 'Own the Market',
          price: { amount: '₦5M', unit: 'BUILD', recurringAmount: '₦2.3M/MO' },
          specs: [
            '▸ Multi-line e-commerce',
            '▸ Chatbot + broadcast CRM — sells & re-sells',
            '▸ All platforms + creator distribution',
          ],
          footLabel: 'THE FULL MACHINE',
          tone: 'default',
        },
      ]),
      band: {
        text: "Starter's chatbot answers. Standard's sells. *Scale's sells and brings customers back.*",
        cta: wa('Which tier fits me?', 'Hello DXI, which Sales Engine tier fits my business?'),
      },
    }),
    stats({
      eyebrow: 'Proof, not promises',
      heading: 'Proof: the engine, running live',
      body: 'A Lagos electronics retailer on the full Sales Engine — named on request in conversation.',
      stats: PROOF_STATS({
        lead: 'direct-response campaigns for trusted phone brands',
        conversations: 'absorbed by the chatbot within days of launch',
        inbound: 'demand proved — then we built the capacity to hold it',
      }),
    }),
    faq({
      eyebrow: 'Questions',
      heading: 'Before you ask',
      items: list([
        {
          question: 'What does the monthly fee cover?',
          answer:
            'Campaign management, creative refresh, account management, reporting, and your AI chatbot subscription — the always-on sales channel. Ad spend is separate, funded by you, and paid directly to the platforms.',
        },
        {
          question: 'Do I own the website?',
          answer:
            'Yes — your website, domain, content, and ad accounts are yours, including if you leave. The chatbot runs on the DXI platform under subscription, like any software you subscribe to.',
        },
        {
          question: 'How fast can we launch?',
          answer:
            'It depends on the tier and your inputs (products, brand assets, approvals). We agree the timeline in writing at the blueprint stage before anything is built.',
        },
        {
          question: 'Do you guarantee results?',
          answer:
            "We agree targets and review them with you monthly — and our case studies are real. But nobody can honestly guarantee advertising outcomes, and we won't pretend to. We'd rather show you the numbers.",
        },
      ]),
    }),
    closing({
      heading: 'Ready to stop leaking sales?',
      body: "Tell us about your business. We'll tell you which tier fits — honestly.",
      ctas: [wa('Chat on WhatsApp', "Hello DXI, I'm interested in the Sales Engine.")],
    }),
  ],
};

const contentEngine = {
  _id: 'page-content',
  _type: 'page',
  title: 'Content Engine',
  slug: { _type: 'slug', current: 'content' },
  breadcrumb: 'ENGINE NO. 02',
  seo: {
    title: 'DXI Content Engine — The Studio',
    description:
      'A full production house inside the agency: design, video, photography, live streaming and audio. Inside every engine, or booked on its own.',
  },
  sections: [
    hero({
      tone: 'light',
      eyebrow: 'Engine No. 02 · The studio',
      heading: 'Content\nEngine',
      sub: "A full production house inside the agency. Every product runs on content — ads, catalogues, clips, campaigns, jingles. We make ours in-house. We'll make yours on request.",
      ctas: [wa('Book the studio', 'Hello DXI, I need content production.')],
    }),
    plates({
      background: 'ash',
      eyebrow: 'Capabilities',
      heading: 'Three departments, one standard',
      plates: list([
        {
          kicker: 'DEPT / DESIGN',
          kickerRight: '01',
          title: 'Design',
          description:
            'Brand identities, campaign creative, ad visuals, product catalogues, and social media kits — built on your brand system, delivered on schedule.',
          footLabel: 'MAKE IT LOOK RIGHT',
          tone: 'default',
        },
        {
          kicker: 'DEPT / VIDEO, PHOTO & LIVE',
          kickerRight: '02',
          title: 'Video, Photo & Live',
          description:
            'Ad films, documentaries, product and event photography, short-form content, clipping masters — and live streaming for launches, services, and events, produced end to end.',
          footLabel: 'MAKE IT MOVE',
          tone: 'dark',
        },
        {
          kicker: 'DEPT / AUDIO',
          kickerRight: '03',
          title: 'Audio',
          description:
            'Radio jingles, ad soundtracks, voice-overs, and sound design — audio built to make your brand recognisable with the screen off.',
          footLabel: 'MAKE IT HEARD',
          tone: 'default',
        },
      ]),
      band: {
        text: 'Available inside every DXI product — *or booked on its own.*',
        cta: wa('Book the studio', 'Hello DXI, I need content production.'),
      },
    }),
    closing({
      heading: 'Got something to make?',
      body: "Tell us what you need — we'll tell you how we'd make it.",
      ctas: [wa('Chat on WhatsApp', 'Hello DXI, I need content production.')],
    }),
  ],
};

const viralEngine = {
  _id: 'page-viral-engine',
  _type: 'page',
  title: 'Viral Engine',
  slug: { _type: 'slug', current: 'viral-engine' },
  breadcrumb: 'ENGINE NO. 03',
  seo: {
    title: 'DXI Viral Engine — Pay For Views, Not Posts',
    description:
      'Campaigns priced per verified view with a guaranteed view target, delivered by the DXI Market Force creator network.',
  },
  sections: [
    hero({
      eyebrow: 'Product No. 03 · The distribution force',
      heading: 'Viral\nEngine',
      sub: 'Traditional influencer marketing charges you for the act of posting. The Viral Engine charges you for the audience that actually arrived — delivered by the DXI Market Force, our managed creator network.',
      ctas: [
        wa('Brief us a campaign', 'Hello DXI, I have a launch to push with the Viral Engine.'),
        anchor('See campaigns', 'packages'),
      ],
    }),
    cards({
      eyebrow: 'How it works',
      heading: 'Pay for views, not posts',
      body: 'Your campaign is priced per verified view, with a guaranteed view target agreed at briefing — delivered by a managed force of nano-influencers clipping and pushing your content across TikTok, Instagram and beyond.',
      cards: list([
        {
          title: 'Managed end-to-end',
          body: 'We recruit, brief, approve every post, verify every number, and pay every creator.',
        },
        {
          title: 'Performance-paid creators',
          body: 'Creators earn on verified views, not posting — so your budget follows results.',
        },
        {
          title: 'The view guarantee',
          body: "Short of target? We extend at our own cost until it's delivered.",
        },
      ]),
    }),
    plates({
      sectionId: 'packages',
      background: 'ash',
      eyebrow: 'Campaigns',
      heading: 'Three ways to take over the feed',
      plates: list([
        {
          kicker: 'CAMPAIGN / LAUNCH',
          kickerRight: 'NO. 01',
          title: 'Launch',
          price: { amount: 'FROM ₦1M' },
          specs: ['▸ 50–60 creators', '▸ 2–3 week window', '▸ TikTok + Instagram'],
          footLabel: 'MAKE IT KNOWN',
          tone: 'default',
        },
        {
          kicker: 'CAMPAIGN / SURGE',
          kickerRight: 'NO. 02',
          title: 'Surge',
          price: { amount: 'FROM ₦2.5M' },
          specs: ['▸ 120+ creators', '▸ 3–4 week window', '▸ Multi-platform + X'],
          footLabel: 'BE EVERYWHERE',
          tone: 'dark',
        },
        {
          kicker: 'CAMPAIGN / TAKEOVER',
          kickerRight: 'NO. 03',
          title: 'Takeover',
          price: { amount: 'FROM ₦5M' },
          specs: ['▸ 250+ creators', '▸ 4–6 week window', '▸ All platforms + campaign manager'],
          footLabel: 'OWN THE MOMENT',
          tone: 'default',
        },
      ]),
      band: {
        text: 'Built for launches with a window: *films, music, products, campaigns.*',
        cta: wa('Brief us', 'Hello DXI, I have a launch to push with the Viral Engine.'),
      },
    }),
    faq({
      eyebrow: 'Questions',
      heading: 'Before you ask',
      items: list([
        {
          question: 'How do I know the views are real?',
          answer:
            'Views are counted from platform-reported data on approved campaign content and cross-checked at campaign close. Fraud-flagged activity is excluded from your totals — and from creator payouts, which removes the incentive to fake it.',
        },
        {
          question: 'What content do the creators post?',
          answer:
            'Content built from materials you license to the campaign — film scenes, music, product footage — shaped by a brief you sign off. Every post is approved before it goes live. Nothing is published without approval.',
        },
        {
          question: 'What does a campaign cost?',
          answer:
            'Campaigns start from ₦1M. Your exact rate per view and guaranteed view target are agreed at briefing, based on the content, platforms, and timing.',
        },
        {
          question: 'Is this just for entertainment?',
          answer:
            'Entertainment launches are the natural fit — a film or single lives or dies in its opening window. But any brand with a moment to win works: product drops, events, campaigns.',
        },
      ]),
    }),
    closing({
      heading: 'Your launch has a window.',
      body: "Let's fill it with a force.",
      ctas: [wa('Brief us on WhatsApp', 'Hello DXI, I have a launch to push with the Viral Engine.')],
    }),
  ],
};

const prEngine = {
  _id: 'page-pr-engine',
  _type: 'page',
  title: 'PR Engine',
  slug: { _type: 'slug', current: 'pr-engine' },
  breadcrumb: 'ENGINE NO. 04',
  seo: {
    title: 'DXI PR Engine — Verified Placements, Not Effort',
    description:
      'Real stories developed by real writers, published on real platforms. Every placement a live URL you can check.',
  },
  sections: [
    hero({
      eyebrow: 'Engine No. 04 · The credibility engine',
      heading: 'PR\nEngine',
      sub: 'Traditional PR sells effort — retainers, releases, hope. The PR Engine sells outcomes: real stories, developed by real writers, published on real platforms. Every placement a live URL you can check.',
      ctas: [
        wa('Bring us your story', 'Hello DXI, I have news for the PR Engine.'),
        anchor('How it works', 'how'),
      ],
    }),
    cards({
      sectionId: 'how',
      eyebrow: 'How it works',
      heading: 'From media kit to live coverage',
      body: 'You provide the announcement — the facts, the images, the story. Writers from the DXI Market Force network develop it into real coverage across platforms chosen with you by tier and audience fit.',
      cards: list([
        {
          title: 'Developed, not blasted',
          body: 'No spray-and-pray press releases. Writers build genuine stories from your media kit — angles their audiences actually read.',
        },
        {
          title: 'Approved before publishing',
          body: 'Every piece passes DXI approval: facts checked against your kit, brand rules met, sponsored content transparently labelled — which is what keeps it credible.',
        },
        {
          title: 'Verified, or it doesn’t count',
          body: 'You pay for placements that publish and stay live, confirmed by a live-check. Your closing report is a list of URLs, not a list of efforts.',
        },
      ]),
    }),
    cards({
      background: 'ash',
      columns: 2,
      eyebrow: 'Who it serves',
      heading: 'News worth spreading',
      cards: list([
        {
          title: 'Launches & announcements',
          body: 'A product drop, a partnership, a milestone — a coordinated set of stories landing across platforms in your window, while it’s still news.',
          tone: 'light',
        },
        {
          title: 'Credibility building',
          body: 'Startups and growing businesses whose investors and partners Google them and find nothing. The PR Engine builds the searchable press trail.',
          tone: 'dark',
        },
      ]),
      band: {
        text: 'Pairs with the Viral Engine: *stories in the press, clips in the feeds.* One launch, full spectrum.',
        cta: wa('Brief us', 'Hello DXI, I have news for the PR Engine.'),
      },
    }),
    closing({
      heading: 'Got news? Make it travel.',
      body: "Bring us the announcement — we'll map the platforms, tiers, and timeline.",
      ctas: [wa('Chat on WhatsApp', 'Hello DXI, I have news for the PR Engine.')],
    }),
  ],
};

const marketForce = {
  _id: 'page-market-force',
  _type: 'page',
  title: 'Market Force',
  slug: { _type: 'slug', current: 'market-force' },
  breadcrumb: 'THE NETWORK',
  seo: {
    title: 'DXI Market Force — The Network Behind The Engines',
    description:
      'A managed, ranked network of creators, clippers and writers — briefed by DXI, approved by DXI, and paid on verified performance.',
  },
  sections: [
    hero({
      eyebrow: 'The network behind the engines',
      heading: 'Market\nForce',
      sub: "Campaigns don't deliver themselves. Behind every DXI Viral and PR campaign is a managed, ranked network of creators, clippers, and writers — briefed by DXI, approved by DXI, and paid on verified performance. This is the Force.",
      ctas: [anchor('Join the Force', 'join', 'signal'), anchor('For clients', 'clients')],
    }),
    cards({
      sectionId: 'clients',
      eyebrow: 'For clients',
      heading: 'Why the Force matters to your campaign',
      body: 'You never buy the Market Force directly — you buy a Viral or PR Engine campaign, and the Force delivers it. What it guarantees you:',
      cards: list([
        {
          title: 'Approved, always',
          body: "Every clip and every article passes DXI approval before it goes live. Your brand never travels in content you haven't seen.",
        },
        {
          title: 'Paid on proof',
          body: 'Members earn on verified views and live-checked placements — not on posting. Faking numbers costs them their place. Your budget follows real results.',
          tone: 'dark',
        },
        {
          title: 'Ranked, and rising',
          body: 'Every campaign ranks the bench. Top performers get selected first and earn more — so the Force delivering your campaign is always its current best.',
        },
      ]),
    }),
    cards({
      sectionId: 'tracks',
      background: 'ash',
      columns: 2,
      eyebrow: 'Two tracks',
      heading: 'Creators clip. Writers tell.',
      cards: list([
        {
          title: 'Clippers & creators',
          body: "You receive licensed campaign content — film scenes, music, product footage — and a clear brief. You clip, caption, and push it on your TikTok, Instagram, or X. Every approved post earns a base; verified views earn more. The better you perform, the earlier you're picked and the more you earn.",
          tone: 'light',
        },
        {
          title: 'Writers',
          body: 'You receive a media kit — facts, angles, approved quotes — and develop a real story in your own voice for your platform. Every piece passes DXI approval, publishes with the proper label, and pays a flat fee once it’s live-checked. Moonlighting from a bigger desk? Your platform is welcome here.',
          tone: 'dark',
        },
      ]),
      band: {
        text: 'Exact rates are shared at onboarding — *and payment lands on verification, every time.*',
        cta: { _type: 'cta', label: 'Join the Force', kind: 'anchor', anchor: 'join', style: 'signal' },
      },
    }),
    cards({
      columns: 2,
      eyebrow: 'The deal',
      heading: 'How the Force works',
      cards: list([
        {
          title: 'What DXI brings',
          body: 'Licensed content and clean briefs · approval that protects you legally · verified counting you can trust · payment on proof, on time · a ranking that rewards your work with more work.',
        },
        {
          title: 'What we ask',
          body: 'Post only what’s approved · disclose what’s sponsored · hit your briefs and windows · real numbers only — fraud ends membership, permanently · represent the campaign like it’s yours, because it is.',
        },
      ]),
    }),
    closing({
      sectionId: 'join',
      heading: 'Join the founding bench.',
      body: "Send us your handle or platform, links to your three best pieces, and which track you're joining — clipper or writer. We review, we onboard, you get your first brief.",
      ctas: [wa('Apply on WhatsApp', 'Hello DXI, I want to join the Market Force. My track: ')],
    }),
  ],
};

const academy = {
  _id: 'page-academy',
  _type: 'page',
  title: 'Academy',
  slug: { _type: 'slug', current: 'academy' },
  breadcrumb: 'ACADEMY',
  seo: {
    title: 'DXI Academy — Become the Business Lenders Say Yes To',
    description:
      'A working membership for founders: structuring, mentorship, marketing support, and introductions to MSME financing partners. ₦50,000/year.',
  },
  sections: [
    hero({
      tone: 'light',
      eyebrow: 'Product No. 02 · The starting point',
      heading: 'DXI\nAcademy',
      sub: "Lenders in Nigeria are actively looking for businesses to finance — and most businesses aren't ready to be found. The Academy fixes that.",
      ctas: [anchor('Get started', 'start', 'signal'), anchor('What you get', 'gifts', 'line')],
    }),
    cards({
      sectionId: 'gifts',
      background: 'ash',
      eyebrow: 'What membership gives you',
      heading: 'Three gifts, one community',
      cards: list([
        {
          title: 'We get you ready',
          body: 'Structuring, records, registration, pricing — plus mentorship from business leaders and consultants convened by DXI. The things that make a lender take you seriously.',
        },
        {
          title: 'We help you sell',
          body: 'Financiers want to see cashflow — so the DXI team works on your marketing with you and helps you drive real sales. Not theory. The same work we do for paying clients.',
        },
        {
          title: 'We introduce you',
          body: "When you're ready, we put you directly in front of MSME finance partners actively searching for businesses like yours. The decision is always the lender's — our job is making you the business they say yes to.",
        },
      ]),
      band: {
        text: 'Membership: *₦50,000 / year.* Deliberately affordable. Deliberately demanding.',
        cta: wa('Register interest', 'Hello DXI, I want to join the Academy.'),
      },
    }),
    cards({
      sectionId: 'start',
      columns: 2,
      eyebrow: 'Get started',
      heading: 'Two steps to join',
      body: 'Membership opens the moment both are done. No waiting list, no interview — just the work.',
      cards: list([
        {
          step: '01',
          title: 'Tell us your business',
          body: "Complete your business profile — it's how we understand where you are, what you sell, and the support you need first. It's also what lets us match you to the right help and, in time, the right lender. Takes about ten minutes.",
          tone: 'light',
          emphasis: true,
          showTick: false,
          cta: toPath('Fill your business profile', '/business-profile'),
        },
        {
          step: '02',
          title: 'Pay your membership',
          body: "Right after you submit your profile, you'll receive your membership payment details — ₦50,000 for the year. Once it's settled, you're in: your community, your mentors, your member rates, all live.",
          tone: 'dark',
          emphasis: true,
          showTick: false,
          cta: staticCta('Sent after your profile'),
        },
      ]),
      band: {
        text: 'One profile, one payment, one year of being taken seriously — *₦50,000.*',
        cta: toPath('Start now', '/business-profile'),
      },
    }),
    {
      _key: key(),
      _type: 'courseGrid',
      sectionId: 'courses',
      background: 'ash',
      eyebrow: 'On-demand courses',
      heading: 'Learn at your pace',
      body: 'Practical, no-fluff lessons for building a real business. Some are open to everyone; the full library is members-only.',
    },
    {
      _key: key(),
      _type: 'webinarGrid',
      sectionId: 'webinars',
      background: 'paper',
      eyebrow: 'Webinars & live sessions',
      heading: 'Learn with us, live',
      body: 'Live workshops and Q&As with the DXI team and guests. Some open to all; some reserved for members.',
    },
    steps({
      eyebrow: 'The journey',
      heading: 'From member to machine',
      steps: list([
        {
          title: 'Enrol',
          body: 'Join, complete your business profile, meet your cohort and accountability group.',
        },
        {
          title: 'Structure',
          body: 'Records, registration, positioning, pricing — the fundamentals partners look for.',
        },
        {
          title: 'Grow',
          body: 'Build your marketing engine with DXI guidance and member rates on execution.',
        },
        {
          title: 'Get ready',
          body: 'Complete the financing-readiness track and get introduced when you qualify.',
        },
        {
          title: 'Graduate',
          body: 'Proven members move into the Sales Engine with their Academy history counting for them.',
        },
      ]),
    }),
    faq({
      background: 'ash',
      eyebrow: 'Questions',
      heading: 'Asked honestly, answered honestly',
      items: list([
        {
          question: 'Will the Academy get me a loan?',
          answer:
            "No one can honestly promise you a loan — the decision always belongs to the lender. What the Academy does is make your business the kind lenders say yes to, and introduce you to partners who are genuinely looking. That's a real edge; it's just not a guarantee, and anyone who guarantees you one is lying.",
        },
        {
          question: 'Who is the Academy for?',
          answer:
            'Registered or registering early-stage businesses that are ready to work. It is not for idea-stage tourists — members are held to participation standards, and inactive members are not renewed.',
        },
        {
          question: 'What does it cost after the first year?',
          answer:
            'Membership renews at the standard annual rate. Members in good standing keep their community, their mentors, and their member rates on DXI services.',
        },
        {
          question: 'I run an institution. Can we partner?',
          answer:
            'Yes — MSME lenders and institutions partner with the Academy on qualified pipelines and co-branded cohorts. Message us and ask for the partner brief.',
        },
      ]),
    }),
    {
      _key: key(),
      _type: 'richSection',
      background: 'ash',
      eyebrow: 'Partners',
      heading: 'Built with institutions that back businesses',
      content: [
        {
          _key: key(),
          _type: 'block',
          style: 'normal',
          markDefs: [
            {
              _key: 'partnerLink',
              _type: 'link',
              href: 'https://wa.me/2348074533441?text=Hello%20DXI%2C%20we%27re%20an%20institution%20interested%20in%20partnering%20with%20the%20Academy.',
            },
          ],
          children: [
            {
              _key: key(),
              _type: 'span',
              marks: [],
              text: 'The Academy works alongside MSME lenders and institutional partners who finance and support qualified members. Our partner network is being announced soon — if you’re an institution that wants to be part of it, ',
            },
            { _key: key(), _type: 'span', marks: ['partnerLink'], text: 'talk to us' },
            { _key: key(), _type: 'span', marks: [], text: '.' },
          ],
        },
      ],
    },
    closing({
      heading: 'Take your business seriously.',
      body: 'Join a community of builders — backed by a full marketing agency.',
      ctas: [wa('Join via WhatsApp', 'Hello DXI, I want to join the Academy.')],
    }),
  ],
};

const PAGES = [home, salesEngine, contentEngine, viralEngine, prEngine, marketForce, academy];

/* ── Run ──────────────────────────────────────────────────────────────── */

async function main() {
  console.log(`Project ${projectId} · dataset "${dataset}"${dryRun ? ' · DRY RUN' : ''}\n`);

  const documents = [...PAGES, siteSettings];

  if (dryRun) {
    documents.forEach((doc) => {
      const sections = doc.sections ? ` (${doc.sections.length} sections)` : '';
      console.log(`  would write ${doc._type.padEnd(14)} ${doc._id}${sections}`);
    });
    console.log(`\n${documents.length} documents. Nothing written.`);
    return;
  }

  // Pages first: siteSettings and the CTAs reference them, and Sanity rejects
  // a reference to a document that does not exist yet.
  const tx = client.transaction();
  documents.forEach((doc) => tx.createOrReplace(doc));
  await tx.commit();

  documents.forEach((doc) => console.log(`  wrote ${doc._type.padEnd(14)} ${doc._id}`));
  console.log(`\nSeeded ${documents.length} documents into "${dataset}".`);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  if (err.response?.body) console.error(JSON.stringify(err.response.body, null, 2));
  process.exit(1);
});
