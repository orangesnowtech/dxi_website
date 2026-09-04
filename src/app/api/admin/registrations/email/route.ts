import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { BANK_DETAILS, bankDetailsAreConfigured } from "@/lib/academy";
import {
  EVENT_PAYMENT_WINDOW_LABEL,
  formatEventPlace,
  formatEventWhen,
  formatFee,
  paymentReference,
} from "@/lib/events";
import { getEvent, getRegistration, stampRegistration } from "@/lib/firebase/events";
import { getZeptoConfig, sendZeptoEmail } from "@/lib/zeptomail";
import {
  EVENTS_FROM_NAME,
  buildEventPaymentDetailsEmail,
  buildEventRejectionEmail,
  buildEventTicketEmail,
  type EventEmailFacts,
} from "@/lib/emails/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const KINDS = ["ticket", "payment", "rejection"] as const;

type Kind = (typeof KINDS)[number];

/**
 * Sends one of the three registrant emails by hand from the dashboard.
 *
 * Kept separate from the status change so a reviewer can fix a typo in
 * somebody's name, or re-send a ticket somebody deleted, without shuffling
 * their status back and forth to trigger it.
 */
export async function POST(request: NextRequest) {
  const { session, response: unauthorized } = await requireAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id, kind, note } = (await request.json()) as {
      id?: string;
      kind?: string;
      note?: string;
    };

    if (!id) {
      return NextResponse.json({ error: "Registration ID is required." }, { status: 400 });
    }

    if (!kind || !(KINDS as readonly string[]).includes(kind)) {
      return NextResponse.json(
        { error: `Email kind must be one of: ${KINDS.join(", ")}` },
        { status: 400 }
      );
    }

    const registration = await getRegistration(id);

    if (!registration) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    const event = await getEvent(registration.eventSlug);

    const facts: EventEmailFacts = {
      // Falls back to the values copied onto the registration, so a deleted or
      // renamed event still produces a correct email.
      eventTitle: event?.title || registration.eventTitle,
      when: formatEventWhen(event?.startsAt || registration.eventStartsAt, event?.endsAt),
      where: event ? formatEventPlace(event) : "See your original confirmation",
      typeLabel: registration.typeLabel,
    };

    const { token, fromAddress } = getZeptoConfig();

    if (!token || !fromAddress) {
      return NextResponse.json(
        { error: "Email is not configured. Set ZEPTOMAIL_TOKEN and ZEPTOMAIL_SENDER_ADDRESS." },
        { status: 500 }
      );
    }

    let built;
    let stampField: "paymentDetailsSentAt" | "rejectionSentAt" | "ticketSentAt" | null = null;

    if (kind === ("payment" satisfies Kind)) {
      if (registration.feeNaira <= 0) {
        return NextResponse.json(
          { error: "This is a free place — there is nothing to pay." },
          { status: 400 }
        );
      }

      if (!bankDetailsAreConfigured()) {
        return NextResponse.json(
          { error: "Bank details are not configured in src/lib/academy.ts." },
          { status: 500 }
        );
      }

      built = buildEventPaymentDetailsEmail({
        firstName: registration.firstName,
        facts,
        amountLabel: formatFee(registration.feeNaira),
        bankDetails: BANK_DETAILS,
        paymentReference: paymentReference(registration.accessCode),
        paymentWindowLabel: EVENT_PAYMENT_WINDOW_LABEL,
      });
      stampField = "paymentDetailsSentAt";
    } else if (kind === ("rejection" satisfies Kind)) {
      built = buildEventRejectionEmail({
        firstName: registration.firstName,
        facts,
        note,
      });
      stampField = "rejectionSentAt";
    } else {
      // A ticket is the one email that carries the access code, so it only
      // goes to somebody whose place is actually confirmed.
      if (registration.status !== "confirmed") {
        return NextResponse.json(
          { error: "Confirm this registration before sending the ticket." },
          { status: 400 }
        );
      }

      built = buildEventTicketEmail({
        firstName: registration.firstName,
        facts,
        accessCode: registration.accessCode,
        joinUrl: event?.format === "online" ? event.joinUrl || undefined : undefined,
        checkInUrl:
          event?.format === "venue"
            ? `${request.nextUrl.origin}/events/${event.slug}/check-in?code=${registration.accessCode}`
            : undefined,
        paidLabel: registration.feeNaira > 0 ? formatFee(registration.feeNaira) : undefined,
      });
      stampField = "ticketSentAt";
    }

    await sendZeptoEmail(
      {
        from: { address: fromAddress, name: EVENTS_FROM_NAME },
        to: [
          {
            email_address: {
              address: registration.email,
              name: registration.fullName,
            },
          },
        ],
        subject: built.subject,
        htmlbody: built.html,
      },
      token
    );

    if (stampField) {
      await stampRegistration(id, stampField, session.email);
    }

    return NextResponse.json({ message: `Sent to ${registration.email}` });
  } catch (error) {
    console.error("Failed to send registration email:", error);
    return NextResponse.json({ error: "Could not send the email." }, { status: 500 });
  }
}
