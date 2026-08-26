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
