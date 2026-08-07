import type { Page } from "@/lib/sanity/types";
import { keyed, hero, plates, closing, wa } from "../helpers";

export const contentEngine: Page = {
  _id: "page-content",
  title: "Content Engine",
  slug: "content",
  breadcrumb: "ENGINE NO. 02",
  seo: {
    title: "DXI Content Engine — The Studio",
    description:
      "A full production house inside the agency: design, video, photography, live streaming and audio. Inside every engine, or booked on its own.",
  },
  sections: [
    hero({
      tone: "light",
      eyebrow: "Engine No. 02 · The studio",
      heading: "Content\nEngine",
      sub: "A full production house inside the agency. Every product runs on content — ads, catalogues, clips, campaigns, jingles. We make ours in-house. We'll make yours on request.",
      ctas: [wa("Book the studio", "Hello DXI, I need content production.")],
    }),

    plates({
      background: "ash",
      eyebrow: "Capabilities",
      heading: "Three departments, one standard",
      plates: keyed([
        {
          kicker: "DEPT / DESIGN",
          kickerRight: "01",
          title: "Design",
          description:
            "Brand identities, campaign creative, ad visuals, product catalogues, and social media kits — built on your brand system, delivered on schedule.",
          footLabel: "MAKE IT LOOK RIGHT",
          tone: "default" as const,
        },
        {
          kicker: "DEPT / VIDEO, PHOTO & LIVE",
          kickerRight: "02",
          title: "Video, Photo & Live",
          description:
            "Ad films, documentaries, product and event photography, short-form content, clipping masters — and live streaming for launches, services, and events, produced end to end.",
          footLabel: "MAKE IT MOVE",
          tone: "dark" as const,
        },
        {
          kicker: "DEPT / AUDIO",
          kickerRight: "03",
          title: "Audio",
          description:
            "Radio jingles, ad soundtracks, voice-overs, and sound design — audio built to make your brand recognisable with the screen off.",
          footLabel: "MAKE IT HEARD",
          tone: "default" as const,
        },
      ]),
      band: {
        text: "Available inside every DXI product — *or booked on its own.*",
        cta: wa("Book the studio", "Hello DXI, I need content production."),
      },
    }),

    closing({
      heading: "Got something to make?",
      body: "Tell us what you need — we'll tell you how we'd make it.",
      ctas: [wa("Chat on WhatsApp", "Hello DXI, I need content production.")],
    }),
  ],
};
