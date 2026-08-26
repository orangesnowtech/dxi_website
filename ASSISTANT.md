# DXI Assistant

A Gemini agent that answers about DXI, captures leads, registers people for
events, and hands over to a person when that is what is needed. Modelled on
`orangesnowtech/purch-whatsapp-bot`, rebuilt around this repo's own content.

Website channel is live. WhatsApp, Messenger and Instagram are next and share
the same agent — they are behind Meta app review, which the web widget is not,
which is why the web widget shipped first.

## Why it lives in this repo

Two reasons, both concrete.

Its answers are flattened out of `src/content` by `lib/bot/knowledge.ts`, so
editing a page changes what the assistant says. A copy in another codebase would
be wrong the first time somebody changed a price and told nobody.

Registering someone for an event is `registerForEvent` — a Firestore transaction
that claims capacity and allocates an access code. A second service doing its
own version would be two things racing for the last seat at a trade fair.

## Shape

```
visitor ─► ChatWidget ─► POST /api/bot/chat
                              │
                     handleIncomingMessage      (lib/bot/conversation.ts)
                              │
                 mode=human ──┤── mode=bot
                 (silent)     │
                              ▼
                         runAgent               (lib/bot/agent.ts)
                    Gemini + function calling
                              │
        ┌─────────────────────┼──────────────────┬───────────────┐
        ▼                     ▼                  ▼               ▼
 listUpcomingEvents    registerForEvent     captureLead    escalateToHuman
   (live Firestore)   (the real txn)      (conversation)   (mode=human)

staff ─► /admin/chats ─► POST /api/admin/chats/[id] ─► widget polls it back
```

## Knowledge, not lookups

The whole site is about four thousand tokens once flattened, so all of it goes
in the system prompt. A question about pricing then costs no tool round trip.
Tools exist only for what a prompt cannot be: data that changes hourly, and
actions with consequences.

## The handoff

`escalateToHuman` sets `mode: "human"` and the bot goes **completely silent** —
two voices answering one person is worse than a slow reply. A handoff nobody
answers within `BOT_HANDOFF_TIMEOUT_MINUTES` (15) returns to the bot, because
silence is the worse failure.

Replying from the dashboard takes the conversation off the bot automatically,
rather than leaving that as a separate click somebody forgets.

The widget polls `GET /api/bot/chat` for agent replies, but only once handed off
and only while open — polling every visitor's widget would be a request every few
seconds for messages that, in the bot's own conversations, never arrive.

## Gemini 3 notes

Two things differ from the Purch code and both look like broken integrations:

- **`gemini-2.5-flash` is closed to new API keys.** It answers 404 pointing at
  the current flash model. The default here is `gemini-3.6-flash`.
- **Thought signatures.** Gemini 3 attaches one to every `functionCall` part and
  rejects the next request without it. The model's turn must be echoed back as
  the API returned it — rebuilding it from `name` and `args` drops the signature
  and every tool call fails with `INVALID_ARGUMENT`.
- Thinking tokens come out of `maxOutputTokens`, so a budget sized for the
  visible answer gets eaten by reasoning and replies arrive cut off mid-sentence.
  `thinkingLevel: MINIMAL` suits a front desk and leaves the budget for words.

## Guardrails

In the system prompt, and worth keeping there: never invent a price, date or
result; never promise an outcome; never put bank details in chat (they are
emailed after an approval); never ask for a card number or BVN; never claim to
be human.

Cost and abuse are bounded by `BOT_HOURLY_MESSAGE_LIMIT` (40 model calls per
conversation per hour), counted over stored messages so it survives an instance
recycling.

## Configuration

```
GEMINI_API_KEY=                    # unset = no widget rendered, endpoint 503s
GEMINI_MODEL=gemini-3.6-flash
BOT_HANDOFF_TIMEOUT_MINUTES=15
BOT_HOURLY_MESSAGE_LIMIT=40
```

With no key the assistant is **inert, not broken**: the layout renders no widget
and the endpoint answers 503.

For deployment the key must exist in Secret Manager *before* it is named in
`apphosting.yaml` — naming a secret that does not exist fails the build.

## Known limits

- **Web only.** The Meta channels need a Business account, tokens, app review,
  and the privacy/terms/data-deletion pages Meta requires.
- **Polling, not streaming.** Replies appear within about six seconds. Fine at
  this volume; a socket would be the answer if it ever is not.
- **No conversation-level analytics** beyond what the dashboard lists.
