# Meta channels — WhatsApp, Messenger, Instagram

The code side is done. This is the Meta side, which is dashboard work nobody
can do from a repo, plus the four values that connect the two.

One Meta app hosts three products. All three deliver to **one** webhook, and
from there they are the same agent, the same conversation store and the same
`/admin/chats` dashboard as the website widget. There is no per-channel bot.

```
WhatsApp ──┐
Messenger ─┼─► POST /api/webhooks/meta ─► parseInbound ─► handleIncomingMessage
Instagram ─┘        (signature)         (lib/bot/channels.ts)        │
                                                                     ▼
                                                              runAgent / silence
                                                                     │
staff ─► /admin/chats ─► POST /api/admin/chats/[id] ─► deliver ──────┘
```

## What has to end up true

Meta's dashboard is reorganised often enough that step-by-step screenshots go
stale in months. What follows is the list of things that must be **true** when
you are finished. If a screen has moved, match the intent.

### 0. The values you will be pasting

| Thing | Value |
|---|---|
| Webhook callback URL | `https://dximarketing.com/api/webhooks/meta` |
| Verify token | Invent one. Any long random string. It goes in `META_VERIFY_TOKEN`. |
| App Secret | App → Settings → Basic → App Secret → `META_APP_SECRET` |
| Privacy Policy URL | `https://dximarketing.com/privacy` |
| Terms of Service URL | `https://dximarketing.com/terms` |
| Data Deletion Request URL | `https://dximarketing.com/api/data-deletion` |
| Webhook fields | `messages` everywhere, plus `messaging_postbacks` on Messenger |

Generate a verify token with:

    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

### 1. Foundations

1. The app lives in **DXI's Business Portfolio**, not on a personal profile.
   Moving it later is harder than starting there.
2. **Business Verification** completed on that portfolio. Required for the
   WhatsApp Cloud API and required to go Live at all. Budget days, not hours —
   it wants registration documents and a verifiable address.
3. **App → Settings → Basic**: App Domain `dximarketing.com`, and the three
   policy URLs above. Meta fetches each one, so they have to be deployed first.

### 2. WhatsApp

1. Add the **WhatsApp** product.
2. The **WABA** lives in DXI's portfolio. Add and verify the real number there
   (WhatsApp Manager → Phone numbers → Add). A number already registered on the
   consumer WhatsApp app has to be deleted from it first, which cannot be undone.
3. Register the number for Cloud API with a 6-digit PIN — status becomes
   `CONNECTED`.
4. Create a **system user** with a **never-expiring token** carrying
   `whatsapp_business_messaging` and `whatsapp_business_management`, with the
   WABA assigned to it. That token is `WHATSAPP_TOKEN`.
5. Subscribe the app to the WABA: `POST /{waba-id}/subscribed_apps`.
6. WhatsApp → Configuration → set the callback URL and verify token, subscribe
   the `messages` field.
7. Get the **display name** approved. Messaging limits stay low until Business
   Verification lifts them.

### 3. Messenger

1. Add the **Messenger** product.
2. Connect DXI's Facebook Page to the app.
3. Give the same system user `pages_messaging` **and assign the Page to it**.
   The assignment is the part people miss — without it the Page-token lookup in
   `lib/bot/messaging.ts` comes back empty and every send fails.
4. Same callback URL and verify token. Subscribe `messages` and
   `messaging_postbacks`. Then **subscribe the Page itself** — a separate
   button from subscribing the app.

### 4. Instagram

Use **Instagram messaging via the Messenger Platform**, not the standalone
"Instagram API with Instagram Login". The code speaks the Page-token,
`/me/messages` dialect, which is the former.

1. The IG account must be **Professional** (Business or Creator) and **linked
   to the Facebook Page** from step 3.
2. Add the **Instagram** product and connect the account. In the Instagram app,
   turn on **Allow access to messages**. Nothing is delivered until this is on,
   and it is off by default.
3. Permissions: `instagram_manage_messages` and `instagram_basic`, with the IG
   account assigned to the system user.
4. Same callback URL and verify token. Subscribe the Instagram `messages` field.
5. No new token. Instagram sends through the same Page token, which the code
   resolves by the IG account id.

### 5. Going Live

Real people's messages are not delivered until the app is Live with Advanced
Access. Until then only accounts with a **role on the app** reach the webhook.

1. Exercise each channel in Development mode. This is not just a smoke test:
   App Review requires **at least one successful API call per permission within
   the 30 days before you submit**, and testing is how you produce them.
2. Submit for Advanced Access on `whatsapp_business_messaging`,
   `pages_messaging` and `instagram_manage_messages` — each with a use-case
   description and a screen recording of the flow.
3. Business Verification complete.
4. Flip the app Development → Live.

Testing in Development mode: add your own Facebook account as an app Tester,
then message the Page from it; DM the IG account from an account with a role;
message the WhatsApp number from a listed test recipient.

## Our side

### The secrets

`META_APP_SECRET` and `META_VERIFY_TOKEN` are already created and granted to
both backends. `WHATSAPP_TOKEN` is not, and its entry in `apphosting.yaml` is
**commented out** until it is — naming a secret that does not exist fails the
build for the whole site.

Nothing is blocked by that. The webhook handshake and every inbound message
work without it; only *sending* fails. When you have the token:

    firebase apphosting:secrets:set WHATSAPP_TOKEN
    firebase apphosting:secrets:grantaccess WHATSAPP_TOKEN --backend dxi-webapp-backend
    firebase apphosting:secrets:grantaccess WHATSAPP_TOKEN --backend dxi-redesign-preview

then uncomment the block in `apphosting.yaml` and deploy.

`META_GRAPH_VERSION` is a plain value in `apphosting.yaml`.
`WHATSAPP_PHONE_NUMBER_ID` is commented out beside it — App Hosting **rejects
`value: ""`** and fails the build, so an env var you do not have a value for
has to be absent, not empty. Uncomment it with the id from WhatsApp → API Setup.

The two backends are `dxi-webapp-backend` (dximarketing.com, built from `live`)
and `dxi-redesign-preview` (built from `redesign`). A secret must be granted to
both, or whichever one missed out fails at startup.

`META_PAGE_TOKEN` is optional. Left unset, Messenger and Instagram use
`WHATSAPP_TOKEN` — which is what you want when one all-scope system user owns
everything. Set it only if the Page assets end up under a different token.

### The TTL policy

The webhook writes one document per inbound message to `botInboundMessages` so
a Meta retry is not answered twice. They are worthless within the hour and are
stamped with `expiresAt`. Add the policy once, or the collection grows forever:

    gcloud firestore fields ttls update expiresAt \
      --collection-group=botInboundMessages --enable-ttl

### Verifying it works

The handshake first — this needs nothing but the secrets deployed:

    curl "https://dximarketing.com/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=hello"

It answers `hello`. Anything else and Meta will refuse to save the URL. A `403`
is a token mismatch; check for a trailing newline in the secret.

Then message the number or Page from a role-holding account and watch the
backend logs. `/admin/chats` shows the thread with a channel label on it.

## Things that will bite

- **`Invalid signature` on every delivery.** `META_APP_SECRET` is not the app
  *id*, and it is not an access token. App → Settings → Basic → Show.
- **`No Page token for <id>`.** The Page or IG account is connected to the app
  but not **assigned to the system user**. Two different screens.
- **Instagram silent while Messenger works.** "Allow access to messages" is off
  in the Instagram app's own privacy settings.
- **Nothing arrives from anyone but you.** Expected before App Review. That is
  Development mode working as designed.
- **Replies arrive twice.** Something is answering the webhook slowly enough
  for Meta to retry. The dedupe handles this; if it does not, check the TTL
  policy is not deleting claims early.
- **A reply saved in the dashboard but never sent.** The banner says so
  explicitly and the message stays in the thread. Almost always an expired
  token.

## Deliberate limits

- **Text only.** A sticker, voice note or bare photo gets a line asking for
  words, and the model is not called for it.
- **Processed inline.** App Hosting throttles CPU once a response is sent, so
  work deferred past the response may never run. The cost is that a slow model
  call can cross Meta's ~20s retry threshold — which is exactly what the dedupe
  exists for.
- **No message templates.** Replies go out inside the 24-hour customer service
  window, which a reply to somebody who just wrote in always is. Reaching
  someone *first* on WhatsApp needs an approved template and is not built.
- **The policy pages are drafts.** `/privacy`, `/terms` and `/data-deletion`
  are accurate about what the code does and are what Meta will fetch, but they
  have not been through a lawyer, and `privacy@dximarketing.com` has to be a
  mailbox somebody actually reads before App Review.
