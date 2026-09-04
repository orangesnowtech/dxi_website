import { firestore } from "@/lib/firebase/admin";
import { EVENT_REGISTRATIONS_COLLECTION } from "@/lib/firebase/events";
import type { EventRegistration } from "@/lib/events";
import { normalizeAccessCode, type Recording } from "@/lib/recordings";

/**
 * The five gates.
 *
 * Every one of them is decided here, on the server, immediately before a
 * playback URL is signed. Nothing about who may watch is ever decided in the
 * browser — a gate the player enforces is a gate anyone can read the source of
 * and step around.
 *
 * Each returns a plain verdict rather than throwing, because "you are not
 * allowed" is an ordinary answer to an ordinary request, and the reason has to
 * reach the viewer in words they can act on.
 */

export type AccessProof = {
  /**
   * The code they were sent — from a ticket email for the registrants gate,
   * or from us directly for the `code` gate.
   */
  accessCode?: string;
  /** For the code, lead and academy gates. */
  email?: string;
  name?: string;
  phone?: string;
};

export type AccessVerdict =
  | { ok: true; /** Who watched, for the record. Empty for a public replay. */ watcher: string }
  | {
      ok: false;
      reason: string;
      /** Which boxes the page should put in front of them, or null if none would help. */
      needs: "code" | "code_and_details" | "email" | "details" | null;
    };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Whether this code is one of the codes issued for this replay.
 *
 * The plainest gate we have: a code we set on the recording and sent out, and
 * a name and email so the watch list says who used it. The details are asked
 * for at the same time rather than after, so nobody types a code, waits, and
 * is then asked for something else.
 *
 * Nothing here proves the person is the person we sent the code to — a code
 * that has been forwarded works. That is what the watch log is for: a shared
 * code turning up under nine different names is something you can see and act
 * on, which a silent view count would never have shown you.
 */
function verifyReplayCode(accessCodes: string[], proof: AccessProof): AccessVerdict {
  const submitted = normalizeAccessCode(proof.accessCode || "");
  const email = (proof.email || "").trim().toLowerCase();
  const name = (proof.name || "").trim();

  if (!submitted) {
    return { ok: false, reason: "Enter the access code we sent you.", needs: "code_and_details" };
  }

  if (!accessCodes.includes(submitted)) {
    return {
      ok: false,
      reason: "That code does not open this replay. Check the message we sent you.",
      needs: "code_and_details",
    };
  }

  if (!name || !EMAIL_PATTERN.test(email)) {
    return {
      ok: false,
      reason: "The code is good. Add your name and a working email and it will play.",
      needs: "code_and_details",
    };
  }

  return { ok: true, watcher: email };
}

/**
 * Whether this code holds a confirmed place at the event the replay belongs to.
 *
 * Confirmed specifically, not merely existing: somebody whose payment never
 * landed holds a pending registration, and a pending registration is not a
 * ticket. That is the same line `selfCheckIn` draws at the door.
 */
async function verifyRegistrant(
  eventSlug: string,
  rawCode: string
): Promise<AccessVerdict> {
  const accessCode = normalizeAccessCode(rawCode);

  if (!accessCode) {
    return {
      ok: false,
      reason: "Enter the access code from your ticket email.",
      needs: "code",
    };
  }

  const matches = await firestore
    .collection(EVENT_REGISTRATIONS_COLLECTION)
    .where("eventSlug", "==", eventSlug)
    .where("accessCode", "==", accessCode)
    .limit(1)
    .get();

  if (matches.empty) {
    return {
      ok: false,
      reason: "That code does not match a registration for this event.",
      needs: "code",
    };
  }

  const registration = matches.docs[0].data() as EventRegistration;

  if (registration.status !== "confirmed") {
    return {
      ok: false,
      reason:
        "That registration was never confirmed, so the replay is not open on it yet. Reply to your registration email and we will sort it out.",
      needs: null,
    };
  }

  return { ok: true, watcher: registration.email };
}

/**
 * Whether this email belongs to an approved Academy member.
 *
 * There is no member login on this site — membership lives as an approved
 * `businessProfileSubmissions` record, and nothing here authenticates against
 * it. So this checks that the address exists and is approved, and then plays.
 *
 * Be clear about what that is worth: anybody who knows an approved member's
 * email address can watch as them. It keeps strangers out, not impostors. If
 * a replay is worth more than that, use the `code` gate and send the codes,
 * or close it to registrants of the event they paid for.
 */
async function verifyAcademyMember(rawEmail: string): Promise<AccessVerdict> {
  const email = rawEmail.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, reason: "Enter the email address on your Academy membership.", needs: "email" };
  }

  const matches = await firestore
    .collection("businessProfileSubmissions")
    .where("email", "==", email)
    .where("status", "==", "approved")
    .limit(1)
    .get();

  if (matches.empty) {
    return {
      ok: false,
      reason:
        "We cannot find an approved Academy membership on that address. If you have just applied, it may still be under review.",
      needs: "email",
    };
  }

  return { ok: true, watcher: email };
}

/** Enough of a person to be worth following up. */
function verifyLead(proof: AccessProof): AccessVerdict {
  const email = (proof.email || "").trim().toLowerCase();
  const name = (proof.name || "").trim();

  if (!name || !EMAIL_PATTERN.test(email)) {
    return {
      ok: false,
      reason: "Tell us your name and a working email and it will play.",
      needs: "details",
    };
  }

  return { ok: true, watcher: email };
}

/**
 * Decides whether this request may watch this recording.
 *
 * The recording's own availability — draft, expired — is checked by the caller
 * before this runs, so an expired replay says so instead of asking for a code
 * and then refusing it.
 */
export async function verifyAccess(
  recording: Pick<Recording, "access" | "eventSlug" | "accessCodes">,
  proof: AccessProof
): Promise<AccessVerdict> {
  switch (recording.access) {
    case "public":
      return { ok: true, watcher: "" };

    case "code": {
      const codes = recording.accessCodes || [];

      // Guarded at save time, but a replay saved before that rule existed
      // would otherwise open to anyone who typed anything.
      if (codes.length === 0) {
        return {
          ok: false,
          reason: "This replay is not set up correctly yet. Please let us know.",
          needs: null,
        };
      }

      return verifyReplayCode(codes, proof);
    }

    case "lead":
      return verifyLead(proof);

    case "registrants": {
      // Guarded at save time too, but a replay written before that rule
      // existed would otherwise let everybody through the strictest gate.
      if (!recording.eventSlug) {
        return {
          ok: false,
          reason: "This replay is not set up correctly yet. Please let us know.",
          needs: null,
        };
      }

      return verifyRegistrant(recording.eventSlug, proof.accessCode || "");
    }

    case "academy":
      return verifyAcademyMember(proof.email || "");

    default:
      return { ok: false, reason: "This replay is not available.", needs: null };
  }
}
