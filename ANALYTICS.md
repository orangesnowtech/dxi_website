# Analytics

Google Analytics 4, reached through the Firebase SDK rather than a gtag.js
snippet. `firebase` was already a dependency, so this added no package, and it
keeps the door open to the Firebase-only features — audiences, Remote Config,
A/B tests — that a gtag tag cannot reach.

Property `G-YRK0M86VH7`, on the Firebase web app for `dxi-website-backed`.

## Only real traffic is counted

Preview and production share one Firebase project and therefore **one GA4
property**. Without a gate, every click the team makes while testing on the
preview backend lands in the same reports as customer traffic, and within a
week the numbers mean nothing.

So the tag starts only when `window.location.hostname` is `dximarketing.com` or
a subdomain of it. Localhost is silent. The preview backend is silent. The
`*.hosted.app` backend URLs are silent, including production's own — real
visitors arrive on the apex domain.

Read from the browser rather than configured per backend, the same reasoning as
`ShareLink`: nothing to set per environment, nothing to keep in step.

To confirm the tag fires before trusting it, set
`NEXT_PUBLIC_ANALYTICS_FORCE=1` on a preview backend. Unset it afterwards.

`/admin` is excluded too. Measuring our own dashboard use is noise, and it would
put admin paths into a marketing report.

## What is measured

`page_view` on first load and on every App Router navigation. Firebase sends
the first one itself when analytics starts, so `Analytics.tsx` fires only from
the second page onward — firing both would double every landing page, which is
the one number a marketing site cannot afford to have wrong.

Then the four things worth optimising for:

| Event | Fired when |
| --- | --- |
| `event_registration` | A place is actually held — never on submit. Carries the event slug, the registration type, the resulting status, and `value`/`currency` so a paid place reads as revenue in GA4. |
| `application_submitted` | A business profile application is accepted by the server. |
| `chat_opened` | The chat bubble is opened. The opening half only — a close is not interest. |
| `whatsapp_click` | Any `wa.me` link is clicked. |

WhatsApp clicks are caught by one delegated listener on the document rather
than a handler per button. Those links are scattered through the nav, the
footer, page content and Sanity-driven sections that the team edits without
touching code — a listener catches every one of them, including the ones that
do not exist yet. It listens on the capture phase so a handler that stops
propagation upstream does not quietly cost the measurement.

Event names live in `src/lib/analytics.ts` as functions rather than as bare
strings at each call site. A typo'd event name does not error anywhere: it
silently becomes a second, near-identical row in GA4 that nobody notices for a
month.

## Failing soft

Analytics is measurement, not function. A blocked script, an ad blocker, a
private window that withholds IndexedDB, or a missing measurement id all end in
the site working exactly as before and nothing being recorded. `track()` is
fire-and-forget by design — no caller should ever await a measurement — and
nothing in `analytics.ts` may throw into a render.

`firebase/analytics` is imported dynamically so it lands in its own chunk,
fetched after the page is interactive rather than sitting in the bundle every
visitor waits for.

## Configuration

| Variable | Why |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | The GA4 property. Nothing runs without it. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | The SDK resolves the GA4 stream from the app id and silently does nothing when it is absent. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Part of the same Firebase web app config block. |
| `NEXT_PUBLIC_ANALYTICS_FORCE` | `1` starts the tag off the production domain. For verification only. |

These are plain `value:` entries in `apphosting.yaml`, not Secret Manager
entries like the Firebase keys above them. All three are shipped to every
browser in the JS bundle by definition — an app id and a measurement id are
public identifiers, not credentials, and hiding them behind a secret would
suggest otherwise while protecting nothing.

They must be available at **BUILD** as well as RUNTIME. They are read through
`process.env` in client components, which Next inlines at build time; a
runtime-only value compiles to `undefined` and analytics silently never starts.

## Not done

No consent banner. Firebase Analytics sets cookies and collects IP-derived
location on first load, with no opt-in asked. That is a decision to make
deliberately rather than a gap to fill by reflex — it turns on how much EU
traffic the site gets and what line DXI wants to take under the NDPR. Worth
revisiting before any EU campaign.
