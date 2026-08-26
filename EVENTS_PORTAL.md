# Event Registration Portal

Events are the shallow end of the DXI funnel: a webinar seat, a live training
place, a stand at a trade fair. One event carries several **registration
types**, and the type decides everything downstream — what it costs, whether a
human reviews it, and which questions the form asks.

Modelled on `orangesnowtech/cfg_eventreg_portal`, rebuilt to this repo's
conventions: hand-rolled validation (no zod/react-hook-form), the shared
`FormControls` design language, the existing admin session gate, and ZeptoMail.

## Before it works: deploy the Firestore indexes

The portal's queries need composite indexes. The project currently has none, so
this deploy is purely additive — nothing existing is removed.

```bash
firebase deploy --only firestore:indexes
```

Without this, `/events` returns a 500 (`9 FAILED_PRECONDITION: The query
requires an index`). Everything else — the admin gate, form validation, the
build — works already.

Optionally set `EVENTS_RECIPIENT_EMAIL` so registration alerts land in the
events inbox rather than the general one.

## The flow

Where a registration starts is decided by its type, in
`initialRegistrationStatus`:

| Type | Lands on | Registrant gets |
| --- | --- | --- |
| Free, no review | `confirmed` | Ticket email with entry code |
| Paid, no review | `awaiting_payment` | Bank details + reference |
| Reviewed (vendors) | `pending` | "We have your application" — **no code** |

Review comes before money: nobody is told what to pay for a stand until someone
has decided they should have one. From the dashboard:

- **Approve** → moves to `confirmed` (free) or `awaiting_payment` (paid) *and*
  sends the matching email. One button, because approving silently is how
  someone ends up approved in the dashboard and ignored in their inbox.
- **Mark paid** → `confirmed` + ticket email. This is how a bank transfer is
  recorded; Paystack is still not live (see `src/lib/academy.ts`).
- **Reject** → `rejected` + rejection email, with an optional reviewer note.

Rejecting or cancelling **gives the seat back**. The tallies are adjusted by the
difference between what the two statuses hold, inside the same transaction as
the status write.

## Posters

Each event carries a **square** poster, uploaded in the dashboard and stored in
Firebase Storage (`dxi-website-backed.firebasestorage.app`, under
`event-posters/<slug>/`). Square because the listing card crops to 1:1 — a
portrait flyer loses its top and bottom there, so the aspect is part of the
brief rather than a rendering detail. Non-square artwork is cropped from the
top, not the centre, since a poster leads with its title and key art. A URL can
be pasted instead of uploading.

Objects are **not** made public. Buckets created today default to uniform
bucket-level access, where per-object ACLs are rejected outright, so each upload
carries a `firebaseStorageDownloadTokens` value instead — the same mechanism
behind the client SDK's `getDownloadURL`. Signed URLs were the alternative and
are wrong here: V4 signing caps at seven days, and a poster outliving its own
link is a broken card on the listing page.

The poster is also the Open Graph and Twitter card image, because a shared event
link is mostly seen as a preview before anyone opens it.

Posters render through a plain `<img>` rather than `next/image`: they come from
Storage today and could come from anywhere later, and an optimiser host
allowlist is one more thing that can break a card.

## Sharing

Events are shareable by design. The dashboard's list has a **Copy link** button
per event, and the public page carries a copy control that offers the native
share sheet on phones and falls back to a selectable input where the clipboard
API is unavailable. Both build the URL from the browser's own origin, so they
are correct on preview, on the apex domain and on localhost without a base URL
having to be configured and kept in step.

## Access codes

Six characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` — no O/0 or I/1, because
those get confused precisely when there is a queue. Issued at registration so
the code can double as the transfer narration (`DXI-EV-K7P2QM`), but **only
emailed once the place is confirmed**. A code in a pending applicant's inbox
reads as a ticket they have not got.

Uniqueness is checked, not assumed, inside the registration transaction.

## Capacity

Checked inside the Firestore transaction, never against the read the page
rendered from — the last stand at a trade fair is exactly the one two people
click for at the same moment. Per-type tallies live in an array on the event
document, which is why the whole array is rewritten from a value read in the
same transaction rather than atomically incremented.

An event has a total capacity; each type may have its own. `seatsLeft` returns
the tighter of the two.

## Files

| Path | What it is |
| --- | --- |
| `src/lib/events.ts` | Domain rules. Import-free, like `referral.ts`, so the form, the dashboard and the routes decide the same things the same way. |
| `src/lib/firebase/events.ts` | Every Firestore read and write, including the two transactions. |
| `src/lib/emails/events.ts` | The four registrant emails plus the internal alert. Pure, so copy can be proof-read outside Next. |
| `src/app/events/` | Public listing, detail page, registration form. |
| `src/app/admin/(dashboard)/events/` | Event CRUD and per-event registrations. |
| `src/app/admin/(dashboard)/check-in/` | Door screen. |
| `src/app/api/events/register/` | The one public endpoint. |
| `src/app/api/admin/{events,registrations,check-in}/` | Behind the admin session. |

`FormControls` moved from `src/app/business-profile/` to
`src/app/components/ui/` — it is now shared by the site's two long forms so they
cannot drift apart visually.

## Security notes

- `joinUrl` never leaves the server except in a confirmed registrant's ticket
  email. `toPublicEvent` strips it, and the public pages only ever receive that
  shape — a webinar link on a public page is a webinar anyone can walk into.
- Check-in sits behind `/api/admin` like everything else: the results carry
  attendees' phone numbers, and a door is a public place.
- Firestore rules still deny all direct client access. Every read and write goes
  through the Admin SDK in a route handler.
- Deleting an event is super-admin only and refused once anyone has registered —
  it would orphan their registration. Archive instead.

## Known limits

- **Name search scans the collection.** Firestore cannot do case-insensitive
  substring matching. Scoped to one event and only used when someone has lost
  their code, so it is fine at event scale; it is not a general search.
- **No QR codes.** Codes are typed. The CFG portal's roadmap listed QR too.
- **Payment is manual.** No gateway, by decision — the Academy's bank-transfer
  flow is reused wholesale, including its warning about personal accounts.
- **`datetime-local` uses the admin's own timezone**, not a forced Africa/Lagos.
  An admin in Lagos gets Lagos. Everything *displayed* to registrants is
  formatted in Africa/Lagos regardless.

## Public self check-in

Each event has its own door page at `/events/<slug>/check-in`. Someone enters
the six-character code from their ticket and is marked as arrived. The ticket
email for an in-person event carries a **Check in when you arrive** button with
the code already in the link, so arriving from the email is one tap rather than
reading six characters off one screen and typing them into another.

The page is live only inside its window, which `checkInWindow` decides:

| | |
| --- | --- |
| Opens | `CHECK_IN_LEAD_MINUTES` (30) **before** the start time |
| Closes | at `endsAt`, or `startsAt + ASSUMED_EVENT_HOURS` (6) when none is set |

The lead time is a deliberate softening of "active when the event starts": the
ticket email tells people to arrive about fifteen minutes early, and a door that
refuses everyone until the advertised minute builds the queue it exists to
clear. Set `CHECK_IN_LEAD_MINUTES` to 0 for a hard open exactly on time.

An event with no end time still closes itself, and an unparseable start time
fails **closed** — a door left hanging open is the worse failure.

The window is re-checked inside the transaction, not trusted from the rendered
page, because the page was rendered at some earlier moment.

### Why it only accepts a code

The staff screen at `/admin/check-in` can search by name, email or company
because it sits behind a session. The public page takes an exact access code and
nothing else: a box open to anyone with the URL that answers "who is
registered?" is a way to harvest an attendee list. For the same reason an
unknown code and a code belonging to another event give the same message.

Attempts are throttled per IP per event (12/minute) — in-memory, so it resets
when the instance recycles and is not shared between them. That raises the cost
of a script without pretending to be a security boundary; guessing a code out of
a 32-letter six-character space was never the real risk.

Self check-ins are stamped `checkedInBy: "self"`, so the dashboard shows who
walked themselves in versus who a staff member admitted.
