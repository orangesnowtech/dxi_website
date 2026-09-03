/**
 * Shared shapes for the DXI assistant.
 *
 * Import-free on purpose, like `events.ts` and `referral.ts`, so the widget,
 * the route handlers and the agent all describe a conversation the same way.
 */

/**
 * Where a conversation is happening.
 *
 * `web` needs no Meta approval and is what ships first; the other three arrive
 * through the same webhook and are handled by the same agent, so nothing above
 * this type has to care which one a message came from.
 */
export const BOT_CHANNELS = ["web", "whatsapp", "messenger", "instagram"] as const;

export type BotChannel = (typeof BOT_CHANNELS)[number];

export const BOT_CHANNEL_LABELS: Record<BotChannel, string> = {
  web: "Website",
  whatsapp: "WhatsApp",
  messenger: "Messenger",
  instagram: "Instagram",
};

/**
 * `whisper` is a private steer from staff to the bot. It is stored in the
 * thread, shown in the dashboard, and never sent to the customer or replayed
 * as a conversation turn — it goes into the model's instructions instead.
 */
export type MessageRole = "user" | "assistant" | "agent" | "system" | "whisper";

export type BotMessage = {
  id: string;
  role: MessageRole;
  text: string;
  /** ISO. Written by the server, never trusted from a client. */
  at: string;
  /** Set on `agent` and `whisper` messages — which admin wrote it. */
  sentBy?: string;
};

/** How many standing whispers the agent is given, newest last. */
export const MAX_ACTIVE_WHISPERS = 8;

/**
 * Who owns the conversation right now.
 *
 * `human` silences the bot entirely. Without that a handoff is theatre: the
 * customer gets two voices answering the same question.
 */
export type ConversationMode = "bot" | "human";

export type BotConversation = {
  /** `<channel>:<externalId>` — stable, and readable in the dashboard. */
  id: string;
  channel: BotChannel;
  /** Phone number, page-scoped id, or the web session id. */
  externalId: string;
  /**
   * Which of our numbers or Pages this conversation arrived on. Empty on web.
   *
   * Recorded on first contact so a reply typed in the dashboard days later
   * goes out the way it came in, without the sender having to be guessed from
   * whichever number happens to be configured that week.
   */
  businessId?: string;
  mode: ConversationMode;
  /** Whatever the person has told us, so the agent stops re-asking. */
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  /** Set the moment a lead is captured, so the dashboard can filter. */
  isLead: boolean;
  leadSummary: string;
  escalatedAt: string | null;
  /** True while nobody has replied to a handoff yet. */
  awaitingAgent: boolean;
  lastMessageAt: string;
  lastMessagePreview: string;
  messageCount: number;
  createdAt: string;
};

/** One inbound message, normalised across every channel. */
export type IncomingMessage = {
  channel: BotChannel;
  externalId: string;
  text: string;
  /**
   * Present for Meta channels: the WhatsApp phone number id, or the Page or
   * Instagram account id that received the message. Replies go back out
   * through it, so it is stored on the conversation rather than assumed —
   * otherwise a second Page added later would have its messages answered from
   * the first one.
   */
  businessId?: string;
  /** Meta's own id for the message. Used to mark it read and show typing. */
  messageId?: string;
  /** WhatsApp hands the profile name over in the webhook; the others cost a call. */
  contactName?: string;
  /**
   * Messenger and Instagram do not send the name, and asking Meta for it is a
   * Graph call. Passed as a function so it is made once, when the conversation
   * is created, rather than on every message for a name we already have.
   */
  resolveContactName?: () => Promise<string>;
  /**
   * Set when the message carried nothing the agent can read — a sticker, a
   * voice note, a bare photo. Answered with a line asking for words rather
   * than passed to the model, which would be paying for a reply to "".
   */
  unsupported?: boolean;
};

/** What the agent produced for one turn. */
export type AgentTurn = {
  reply: string;
  /** True when the model asked for a human. */
  escalated: boolean;
  /** Set when the model captured a lead this turn. */
  lead?: { name: string; email: string; phone: string; summary: string };
};

export const MAX_USER_MESSAGE_LENGTH = 2000;

/**
 * Standing instructions from the team, applying to every conversation on every
 * channel — the permanent, global version of a whisper.
 *
 * Stored as one block of text the team writes by hand rather than a list of
 * fields, because the useful rules are sentences ("never quote a price for
 * Market Force") and nobody wants a form for that.
 */
export type BotHouseRules = {
  text: string;
  /** ISO, or null while nobody has written any. */
  updatedAt: string | null;
  updatedBy: string;
};

/**
 * Cap on the standing rules.
 *
 * Every one of these characters is re-sent on every single message, so this is
 * a running cost, not a storage limit. Generous enough for a page of house
 * style, small enough that nobody can paste a brochure in and quietly triple
 * the bill.
 */
export const MAX_HOUSE_RULES_LENGTH = 4000;

/** How much history the agent is given. Enough for context, bounded for cost. */
export const AGENT_HISTORY_TURNS = 16;
