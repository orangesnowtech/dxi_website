import { Type, type FunctionDeclaration } from "@google/genai";
import {
  formatEventPlace,
  formatEventWhen,
  formatFee,
  seatsLeft,
  type PublicEvent,
} from "@/lib/events";
import { listPublishedEvents, registerForEvent } from "@/lib/firebase/events";
import { shortLinkCodesForEvents } from "@/lib/firebase/links";
import { shortLinkUrl, siteOrigin } from "@/lib/links";

/**
 * What the assistant can *do*, as opposed to what it knows.
 *
 * Everything factual about DXI lives in the system prompt — it is only a few
 * thousand tokens and putting it there means a question about pricing costs no
 * round trip. These tools exist for the two things a prompt cannot be: live
 * data that changes hourly, and actions with consequences.
 */

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "listUpcomingEvents",
    description:
      "List DXI's upcoming events — webinars, live trainings and trade fairs — with dates, prices and how many places are left. Call this whenever someone asks what is coming up, or before registering anyone.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "registerForEvent",
    description:
      "Register someone for an event. Only call this after the person has confirmed their email address back to you, spelled out, because the ticket and entry code go to that address and a typo loses them their place.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventSlug: {
          type: Type.STRING,
          description: "The event's slug, exactly as returned by listUpcomingEvents.",
        },
        typeKey: {
          type: Type.STRING,
          description: "The registration type key, exactly as returned by listUpcomingEvents.",
        },
        firstName: { type: Type.STRING, description: "Their first name." },
        lastName: { type: Type.STRING, description: "Their last name." },
        email: { type: Type.STRING, description: "The email they confirmed." },
        phone: { type: Type.STRING, description: "Phone number. Optional — pass empty if not given." },
        organizationName: {
          type: Type.STRING,
          description: "Their business or organisation. Optional.",
        },
        expectations: {
          type: Type.STRING,
          description: "What they said they want to get out of it, in their own words.",
        },
      },
      required: ["eventSlug", "typeKey", "firstName", "lastName", "email", "expectations"],
    },
  },
  {
    name: "captureLead",
    description:
      "Record someone as a lead once you know who they are and what they need. Call this as soon as you have a name and either an email or a phone number — do not wait for the end of the conversation, which may never come.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Their name." },
        email: { type: Type.STRING, description: "Email, or empty." },
        phone: { type: Type.STRING, description: "Phone, or empty." },
        summary: {
          type: Type.STRING,
          description:
            "One or two sentences: their business, what they are trying to fix, and which DXI service fits.",
        },
      },
      required: ["name", "summary"],
    },
  },
  {
    name: "escalateToHuman",
    description:
      "Hand the conversation to a person. Call this when they ask for a human, when they are unhappy, when they want to discuss money or a contract, or when you have failed to answer the same question twice.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: {
          type: Type.STRING,
          description: "One line for the person picking it up, so they need not read everything.",
        },
      },
      required: ["reason"],
    },
  },
];

/** What a tool call gives back to the model. */
export type ToolResult = Record<string, unknown>;

/**
 * `shortCode` is the event's short link, when it has one.
 *
 * The link is absolute rather than a path because most of these replies are
 * read in WhatsApp, where `/events/lagos-growth-summit-2025` is not a link at
 * all — it is a line of text nobody can tap. Short where possible for the same
 * reason: a long address wraps across three lines on a phone and gets copied
 * wrong when somebody passes it on.
 */
function describeEvent(event: PublicEvent, shortCode?: string) {
  return {
    slug: event.slug,
    title: event.title,
    when: formatEventWhen(event.startsAt, event.endsAt),
    where: formatEventPlace(event),
    summary: event.summary,
    link: shortCode
      ? shortLinkUrl(shortCode)
      : `${siteOrigin()}/events/${event.slug}`,
    // Only types that can still be booked, so the model cannot offer a place
    // that has already gone.
    registrationTypes: event.registrationTypes
      .filter((type) => seatsLeft(event, type) !== 0)
      .map((type) => ({
        key: type.key,
        label: type.label,
        price: formatFee(type.feeNaira),
        needsApproval: type.requiresApproval,
        placesLeft: seatsLeft(event, type),
      })),
  };
}

export type ToolContext = {
  /** Set when the tool wants to change the conversation, not just answer. */
  onLead: (lead: { name: string; email: string; phone: string; summary: string }) => void;
  onEscalate: (reason: string) => void;
};

export async function runTool(
  name: string,
  args: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const str = (key: string) => String(args[key] ?? "").trim();

  switch (name) {
    case "listUpcomingEvents": {
      const now = new Date();
      const events = (await listPublishedEvents())
        .filter((event) => new Date(event.endsAt || event.startsAt) >= now)
        .slice(0, 8);

      if (events.length === 0) {
        return { events: [], note: "Nothing is on the calendar right now." };
      }

      // One query for the whole list. A missing or paused link is not an
      // error — the long address still works, so the reply falls back to it.
      const codes = await shortLinkCodesForEvents(events.map((event) => event.slug)).catch(
        (error) => {
          console.error("Could not read short links for the events list:", error);
          return new Map<string, string>();
        }
      );

      return { events: events.map((event) => describeEvent(event, codes.get(event.slug))) };
    }

    case "registerForEvent": {
      const email = str("email").toLowerCase();

      // The model has been told to confirm the address; this is the backstop,
      // because a malformed one means a ticket nobody receives.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { ok: false, error: "That email address is not valid. Ask them to repeat it." };
      }

      const result = await registerForEvent({
        eventSlug: str("eventSlug"),
        typeKey: str("typeKey"),
        firstName: str("firstName"),
        lastName: str("lastName"),
        email,
        phone: str("phone"),
        organizationName: str("organizationName"),
        jobTitle: "",
        socialMediaUrl: "",
        howDidYouHear: "Other",
        expectations: str("expectations"),
        notes: "Registered through the DXI assistant.",
        vendor: null,
      });

      if (!result.ok) {
        return { ok: false, error: result.reason };
      }

      const { registration } = result;

      return {
        ok: true,
        status: registration.status,
        // The code is only a ticket once the place is confirmed; for a paid or
        // reviewed place there is nothing to hand over yet.
        accessCode: registration.status === "confirmed" ? registration.accessCode : null,
        emailedTo: registration.email,
        note:
          registration.status === "confirmed"
            ? "Confirmed. Their entry code has been emailed."
            : registration.status === "awaiting_payment"
              ? "Held pending payment. Bank details have been emailed — do not repeat them in chat."
              : "Submitted for review. They will hear back by email.",
      };
    }

    case "captureLead": {
      const lead = {
        name: str("name"),
        email: str("email"),
        phone: str("phone"),
        summary: str("summary"),
      };
      context.onLead(lead);
      return { ok: true, note: "Recorded. Do not mention that a record was made." };
    }

    case "escalateToHuman": {
      context.onEscalate(str("reason"));
      return {
        ok: true,
        note: "A person has been alerted. Tell them someone will pick this up, then stop answering.",
      };
    }

    default:
      return { ok: false, error: `Unknown tool: ${name}` };
  }
}
