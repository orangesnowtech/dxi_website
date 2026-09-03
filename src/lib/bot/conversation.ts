import { FieldValue } from "firebase-admin/firestore";
import { firestore } from "@/lib/firebase/admin";
import { houseRulesText } from "@/lib/firebase/bot-rules";
import { runAgent } from "./agent";
import { handoffTimeoutMinutes, hourlyMessageLimit } from "./config";
import {
  AGENT_HISTORY_TURNS,
  MAX_ACTIVE_WHISPERS,
  type BotChannel,
  type BotConversation,
  type BotMessage,
  type IncomingMessage,
  type MessageRole,
} from "./types";

export const CONVERSATIONS_COLLECTION = "botConversations";
export const MESSAGES_SUBCOLLECTION = "messages";

const conversations = () => firestore.collection(CONVERSATIONS_COLLECTION);

export function conversationId(channel: BotChannel, externalId: string) {
  return `${channel}:${externalId}`;
}

function messagesRef(id: string) {
  return conversations().doc(id).collection(MESSAGES_SUBCOLLECTION);
}

/**
 * Creates the conversation on first contact, or returns the existing one.
 *
 * Takes the whole inbound message rather than a channel and an id because the
 * Meta channels carry two things worth keeping from the very first delivery:
 * which number or Page it came in on, and — on WhatsApp — the sender's profile
 * name, which is free here and costs a Graph call later.
 */
async function loadOrCreate(incoming: IncomingMessage): Promise<BotConversation> {
  const { channel, externalId } = incoming;
  const id = conversationId(channel, externalId);
  const ref = conversations().doc(id);
  const snapshot = await ref.get();

  if (snapshot.exists) {
    const existing = { ...(snapshot.data() as BotConversation), id };

    // A number can be moved between WABAs, and a conversation opened before
    // this field existed has none at all. Cheap to keep current, and the
    // alternative is a reply that cannot be sent.
    if (incoming.businessId && existing.businessId !== incoming.businessId) {
      await ref.update({ businessId: incoming.businessId });
      existing.businessId = incoming.businessId;
    }

    return existing;
  }

  const now = new Date().toISOString();
  const fresh: BotConversation = {
    id,
    channel,
    externalId,
    businessId: incoming.businessId || "",
    mode: "bot",
    // Only what the channel told us. The agent still asks, and what a person
    // types about themselves overwrites this. Resolved here and nowhere else:
    // this branch runs once per person, ever.
    contactName: incoming.contactName || (await incoming.resolveContactName?.()) || "",
    contactEmail: "",
    contactPhone: "",
    isLead: false,
    leadSummary: "",
    escalatedAt: null,
    awaitingAgent: false,
    lastMessageAt: now,
    lastMessagePreview: "",
    messageCount: 0,
    createdAt: now,
  };

  await ref.set({ ...fresh, createdAtTs: FieldValue.serverTimestamp() });

  return fresh;
}

export async function appendMessage(
  id: string,
  role: MessageRole,
  text: string,
  sentBy?: string
): Promise<BotMessage> {
  const at = new Date().toISOString();
  const doc = messagesRef(id).doc();

  await doc.set({
    role,
    text,
    at,
    ...(sentBy ? { sentBy } : {}),
    // Sorted on. The ISO string is what clients read.
    createdAt: FieldValue.serverTimestamp(),
  });

  await conversations()
    .doc(id)
    .update({
      lastMessageAt: at,
      lastMessagePreview: text.slice(0, 140),
      messageCount: FieldValue.increment(1),
    });

  return { id: doc.id, role, text, at, sentBy };
}

export async function recentMessages(id: string, limit = AGENT_HISTORY_TURNS) {
  // Newest-first in the query so the limit takes the *latest* turns, then
  // reversed — ordering ascending and limiting would give the oldest.
  const snapshot = await messagesRef(id).orderBy("createdAt", "desc").limit(limit).get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<BotMessage, "id">) }))
    .reverse();
}

/**
 * Standing steers staff have whispered into this conversation.
 *
 * Ordered ascending deliberately: that is the direction the rate-limit index
 * already covers, and Firestore counts a descending sort as a different index
 * entirely. Capping in memory instead of with `.limit()` costs nothing here,
 * because whispers are written by hand and a conversation will have a handful,
 * not thousands.
 *
 * The tail is kept so the newest instructions win where two disagree.
 */
export async function activeWhispers(id: string): Promise<string[]> {
  const snapshot = await messagesRef(id)
    .where("role", "==", "whisper")
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs
    .map((doc) => (doc.data() as BotMessage).text)
    .slice(-MAX_ACTIVE_WHISPERS);
}

/**
 * Whether this conversation has burned through its hourly allowance.
 *
 * Counted over stored messages rather than a memory counter, so it survives an
 * instance recycling — the flaw in the check-in throttle, which does not matter
 * there and would matter here, because every call costs money.
 */
async function overRateLimit(id: string): Promise<boolean> {
  const since = new Date(Date.now() - 3_600_000);
  const snapshot = await messagesRef(id)
    .where("role", "==", "user")
    .where("createdAt", ">=", since)
    .count()
    .get();

  return snapshot.data().count > hourlyMessageLimit();
}

export async function escalate(id: string, reason: string) {
  await conversations().doc(id).update({
    mode: "human",
    awaitingAgent: true,
    escalatedAt: new Date().toISOString(),
    escalationReason: reason,
  });
}

export async function setMode(id: string, mode: "bot" | "human", adminEmail?: string) {
  await conversations()
    .doc(id)
    .update({
      mode,
      awaitingAgent: false,
      ...(mode === "bot" ? { escalatedAt: null } : {}),
      ...(adminEmail ? { modeChangedBy: adminEmail } : {}),
    });
}

async function recordLead(
  id: string,
  lead: { name: string; email: string; phone: string; summary: string }
) {
  await conversations()
    .doc(id)
    .update({
      isLead: true,
      leadSummary: lead.summary,
      ...(lead.name ? { contactName: lead.name } : {}),
      ...(lead.email ? { contactEmail: lead.email } : {}),
      ...(lead.phone ? { contactPhone: lead.phone } : {}),
      leadCapturedAt: new Date().toISOString(),
    });
}

/**
 * What a message with nothing readable in it is recorded and answered as.
 *
 * Kept here rather than in the webhook because it is a conversation turn: it
 * is stored in the thread, it is what the customer sees, and the next model
 * call reads it back as history.
 */
const UNSUPPORTED_INBOUND = "[sent an attachment the assistant cannot read]";

const UNSUPPORTED_REPLY =
  "I can only read text at the moment — could you type that out for me?";

export type HandleResult = {
  conversationId: string;
  /** Absent when the bot stayed silent, which is not the same as failing. */
  reply: string | null;
  /**
   * When the reply was stored. The widget advances its poll cursor to this, so
   * a message it has already rendered is never handed back to it again.
   */
  replyAt: string | null;
  mode: "bot" | "human";
};

/**
 * One inbound message, start to finish.
 *
 * The silence rule is the important part: while a person owns the conversation
 * the bot says nothing at all, because two voices answering one question is
 * worse than a slow reply. The exception is a handoff nobody picked up — after
 * the timeout the bot resumes, since silence is the worse failure.
 */
export async function handleIncomingMessage(
  incoming: IncomingMessage
): Promise<HandleResult> {
  const conversation = await loadOrCreate(incoming);
  const id = conversation.id;

  await appendMessage(
    id,
    "user",
    // A sticker, a voice note or a bare photo has no text. Stored as a
    // described placeholder rather than an empty string, so the dashboard
    // shows a person that something arrived instead of a blank row.
    incoming.unsupported ? UNSUPPORTED_INBOUND : incoming.text
  );

  // Answered before the mode check on purpose: this is not the assistant
  // taking a turn, it is the channel saying what it can carry, and it stays
  // true while a colleague owns the thread.
  if (incoming.unsupported) {
    const stored = await appendMessage(id, "assistant", UNSUPPORTED_REPLY);
    return {
      conversationId: id,
      reply: UNSUPPORTED_REPLY,
      replyAt: stored.at,
      mode: conversation.mode,
    };
  }

  if (conversation.mode === "human") {
    const waitedMs = conversation.escalatedAt
      ? Date.now() - new Date(conversation.escalatedAt).getTime()
      : 0;
    const timedOut =
      conversation.awaitingAgent && waitedMs > handoffTimeoutMinutes() * 60_000;

    if (!timedOut) {
      return { conversationId: id, reply: null, replyAt: null, mode: "human" };
    }

    await setMode(id, "bot");
  }

  if (await overRateLimit(id)) {
    const message =
      "You have sent a lot of messages in a short time, so I am going to pause here. Someone from the team will pick this up.";
    const stored = await appendMessage(id, "assistant", message);
    await escalate(id, "Hit the hourly message limit.");
    return { conversationId: id, reply: message, replyAt: stored.at, mode: "human" };
  }

  const history = await recentMessages(id);
  // The just-stored inbound message is in `history`; the agent takes it
  // separately, so drop the tail to avoid sending it twice.
  const priorTurns = history.slice(0, -1);

  // Read fresh on every turn rather than cached, so a rule typed into the
  // dashboard governs the very next reply — which is the whole point of it
  // being editable there instead of in the repo. One document read.
  const [whispers, houseRules] = await Promise.all([activeWhispers(id), houseRulesText()]);

  const turn = await runAgent(incoming.channel, priorTurns, incoming.text, whispers, houseRules);

  if (turn.lead) {
    await recordLead(id, turn.lead);
  }

  const stored = await appendMessage(id, "assistant", turn.reply);

  if (turn.escalated) {
    await escalate(id, turn.lead?.summary || "The assistant asked for a person.");
  }

  return {
    conversationId: id,
    reply: turn.reply,
    replyAt: stored.at,
    mode: turn.escalated ? "human" : "bot",
  };
}

/* ── Dashboard reads ────────────────────────────────────────────────────── */

export async function listConversations(options: {
  mode?: "bot" | "human" | "all";
  leadsOnly?: boolean;
  limit: number;
}) {
  let query = conversations().orderBy("lastMessageAt", "desc").limit(options.limit);

  if (options.mode && options.mode !== "all") {
    query = conversations()
      .where("mode", "==", options.mode)
      .orderBy("lastMessageAt", "desc")
      .limit(options.limit);
  }

  if (options.leadsOnly) {
    query = conversations()
      .where("isLead", "==", true)
      .orderBy("lastMessageAt", "desc")
      .limit(options.limit);
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as BotConversation),
    id: doc.id,
  }));
}

export async function getConversation(id: string) {
  const snapshot = await conversations().doc(id).get();
  return snapshot.exists ? { ...(snapshot.data() as BotConversation), id } : null;
}

export async function allMessages(id: string, limit = 200) {
  const snapshot = await messagesRef(id).orderBy("createdAt", "asc").limit(limit).get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<BotMessage, "id">),
  }));
}

/* ── Erasure ────────────────────────────────────────────────────────────── */

/**
 * Deletes everything stored about one person on the Meta channels.
 *
 * Called by Meta's data-deletion callback, which identifies somebody by an id
 * scoped to our app and says nothing about which channel they used — so every
 * Meta channel is tried and the ones that do not match cost a miss each.
 *
 * The conversation document goes last. If the messages fail to delete the
 * conversation is still there to try again from; the reverse would leave a
 * subcollection nothing points at, which is data we promised to erase and can
 * no longer find.
 */
export async function deleteConversationData(externalId: string): Promise<string[]> {
  const deleted: string[] = [];

  for (const channel of ["whatsapp", "messenger", "instagram"] as const) {
    const id = conversationId(channel, externalId);
    const ref = conversations().doc(id);

    if (!(await ref.get()).exists) {
      continue;
    }

    // Batched rather than one delete per document: a long thread is hundreds
    // of writes, and Meta wants an answer inside its request.
    const messages = await messagesRef(id).get();

    for (let index = 0; index < messages.docs.length; index += 400) {
      const batch = firestore.batch();
      for (const doc of messages.docs.slice(index, index + 400)) {
        batch.delete(doc.ref);
      }
      await batch.commit();
    }

    await ref.delete();
    deleted.push(id);
  }

  return deleted;
}
