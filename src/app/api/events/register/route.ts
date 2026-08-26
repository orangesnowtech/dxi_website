import { NextRequest, NextResponse } from "next/server";
import {
  EVENT_PAYMENT_WINDOW_LABEL,
  HOW_DID_YOU_HEAR_OPTIONS,
  REGISTRATION_REJECTION_MESSAGES,
  formatEventPlace,
  formatEventWhen,
  formatFee,
  paymentReference,
  type EventRecord,
  type EventRegistration,
} from "@/lib/events";
import { registerForEvent, type RegistrationInput } from "@/lib/firebase/events";
import { getEventsRecipient, getZeptoConfig, sendZeptoEmail } from "@/lib/zeptomail";
import { BANK_DETAILS } from "@/lib/academy";
import {
  EVENTS_FROM_NAME,
  buildEventAdminNotificationEmail,
  buildEventPaymentDetailsEmail,
  buildEventTicketEmail,
  buildRegistrationReceivedEmail,
  type EventEmailFacts,
} from "@/lib/emails/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public event registration.
 *
 * Validated by hand rather than with a schema library, to match the business
 * profile route — the site carries no validation dependency and this is not
 * the place to introduce one.
 */

const namePattern = /^[A-Za-z][A-Za-z' -]*$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s()-]{7,20}$/;

type Payload = Record<string, unknown>;

function text(payload: Payload, field: string, max = 200) {
  const value = payload[field];
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isValidUrl(value: string) {
  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(value);

  try {
    return Boolean(new URL(hasProtocol ? value : `https://${value}`).hostname);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Payload;

    const eventSlug = text(payload, "eventSlug", 60);
    const typeKey = text(payload, "typeKey", 32);

    if (!eventSlug || !typeKey) {
      return NextResponse.json(
        { error: "Choose an event and a registration type." },
        { status: 400 }
      );
    }

    const firstName = text(payload, "firstName", 50);
    const lastName = text(payload, "lastName", 50);
    const email = text(payload, "email", 120).toLowerCase();
    const phone = text(payload, "phone", 30);
    const organizationName = text(payload, "organizationName", 120);
    const jobTitle = text(payload, "jobTitle", 120);
    const socialMediaUrl = text(payload, "socialMediaUrl", 200);
    const howDidYouHear = text(payload, "howDidYouHear", 60);
    const expectations = text(payload, "expectations", 1000);
    const notes = text(payload, "notes", 1000);

    if (!namePattern.test(firstName) || firstName.length < 2) {
      return NextResponse.json({ error: "Enter a valid first name." }, { status: 400 });
    }

    if (!namePattern.test(lastName) || lastName.length < 2) {
      return NextResponse.json({ error: "Enter a valid last name." }, { status: 400 });
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    // Optional. A phone number is how we chase someone about a payment or a
    // change of venue, not something worth losing a registration over — but a
    // number that is given must still be usable.
    if (phone && !phonePattern.test(phone)) {
      return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    }

    if (!howDidYouHear || !HOW_DID_YOU_HEAR_OPTIONS.includes(howDidYouHear)) {
      return NextResponse.json(
        { error: "Tell us how you heard about this event." },
        { status: 400 }
      );
    }

    // Optional, but a broken link is worse than none — it goes into a
    // reviewer's notes and gets clicked.
    if (socialMediaUrl && !isValidUrl(socialMediaUrl)) {
      return NextResponse.json(
        { error: "That website or social link does not look valid." },
        { status: 400 }
      );
    }

    const vendorPayload = (payload.vendor || {}) as Payload;
    const vendor = {
      businessName: text(vendorPayload, "businessName", 120),
      offering: text(vendorPayload, "offering", 500),
      boothPreference: text(vendorPayload, "boothPreference", 120),
      repCount: text(vendorPayload, "repCount", 20),
    };

    const input: RegistrationInput = {
      eventSlug,
      typeKey,
      firstName,
      lastName,
      email,
      phone,
      organizationName,
      jobTitle,
      socialMediaUrl,
      howDidYouHear,
      expectations,
      notes,
      vendor,
    };

    const result = await registerForEvent(input);

    if (!result.ok) {
      // A full event and a closed one are the registrant's problem to see, not
      // a server error — 409 so the form can say something specific.
      const status = result.reason === "event_not_found" ? 404 : 409;
      return NextResponse.json(
        { error: REGISTRATION_REJECTION_MESSAGES[result.reason], reason: result.reason },
        { status }
      );
    }

    const { registration, event, type } = result;

    // A vendor type demands the business questions; the transaction has already
    // taken the place by the time we know, so this is checked after and only
    // ever produces a warning in the logs.
    if (type.profile === "vendor" && !vendor.businessName) {
      console.warn(
        `Vendor registration ${registration.id} arrived without a business name.`
      );
    }

    const facts: EventEmailFacts = {
      eventTitle: event.title,
      when: formatEventWhen(event.startsAt, event.endsAt),
      where: formatEventPlace(event),
      typeLabel: type.label,
    };

    await sendRegistrationEmails({ registration, event, facts });

    return NextResponse.json(
      {
        message: "Registration received",
        registrationId: registration.id,
        status: registration.status,
        // The code is shown on the success screen only when it is already a
        // ticket. A pending applicant has no code to show yet.
        accessCode: registration.status === "confirmed" ? registration.accessCode : null,
        feeNaira: registration.feeNaira,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Event registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong on our side. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Sends whichever of the three registrant emails this status calls for, plus
 * the internal alert.
 *
 * Failures are logged and swallowed: the place is already claimed in
 * Firestore, and telling somebody their registration failed because an email
 * bounced would be a lie that costs them their seat.
 */
async function sendRegistrationEmails({
  registration,
  event,
  facts,
}: {
  registration: EventRegistration;
  event: EventRecord;
  facts: EventEmailFacts;
}) {
  const { token, fromAddress } = getZeptoConfig();

  if (!token || !fromAddress) {
    console.error("Event email configuration missing — no emails sent.");
    return;
  }

  const send = async (
    to: { address: string; name: string },
    subject: string,
    htmlbody: string,
    fromName: string
  ) => {
    try {
      await sendZeptoEmail(
        {
          from: { address: fromAddress, name: fromName },
          to: [{ email_address: { address: to.address, name: to.name } }],
          subject,
          htmlbody,
        },
        token
      );
    } catch (error) {
      console.error(`Failed to send "${subject}" to ${to.address}:`, error);
    }
  };

  const registrant = { address: registration.email, name: registration.fullName };

  if (registration.status === "confirmed") {
    const email = buildEventTicketEmail({
      firstName: registration.firstName,
      facts,
      accessCode: registration.accessCode,
      joinUrl: event.format === "online" ? event.joinUrl || undefined : undefined,
    });
    await send(registrant, email.subject, email.html, EVENTS_FROM_NAME);
  } else if (registration.status === "awaiting_payment") {
    const email = buildEventPaymentDetailsEmail({
      firstName: registration.firstName,
      facts,
      amountLabel: formatFee(registration.feeNaira),
      bankDetails: BANK_DETAILS,
      paymentReference: paymentReference(registration.accessCode),
      paymentWindowLabel: EVENT_PAYMENT_WINDOW_LABEL,
    });
    await send(registrant, email.subject, email.html, EVENTS_FROM_NAME);
  } else {
    const email = buildRegistrationReceivedEmail({
      firstName: registration.firstName,
      facts,
      feeLabel: registration.feeNaira > 0 ? formatFee(registration.feeNaira) : undefined,
    });
    await send(registrant, email.subject, email.html, EVENTS_FROM_NAME);
  }

  const alert = buildEventAdminNotificationEmail({
    facts,
    fullName: registration.fullName,
    email: registration.email,
    phone: registration.phone,
    organizationName: registration.organizationName,
    jobTitle: registration.jobTitle,
    socialMediaUrl: registration.socialMediaUrl,
    howDidYouHear: registration.howDidYouHear,
    expectations: registration.expectations,
    notes: registration.notes,
    status: registration.status,
    feeLabel: formatFee(registration.feeNaira),
    accessCode: registration.accessCode,
    vendor: registration.vendor,
  });

  await send(
    { address: getEventsRecipient(), name: "DXI Team" },
    alert.subject,
    alert.html,
    "DXI Event Registrations"
  );
}
