import { FieldValue } from "firebase-admin/firestore";
import { firestore } from "@/lib/firebase/admin";
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

/** Creates the conversation on first contact, or returns the existing one. */
async function loadOrCreate(
  channel: BotChannel,
  externalId: string
): Promise<BotConversation> {
  const id = conversationId(channel, externalId);
  const ref = conversations().doc(id);
  const snapshot = await ref.get();

  if (snapshot.exists) {
    return { ...(snapshot.data() as BotConversation), id };
  }

  const now = new Date().toISOString();
  const fresh: BotConversation = {
    id,
    channel,
    externalId,
    mode: "bot",
    contactName: "",
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
  const conversation = await loadOrCreate(incoming.channel, incoming.externalId);
  const id = conversation.id;

  await appendMessage(id, "user", incoming.text);

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

  const turn = await runAgent(
    incoming.channel,
    priorTurns,
    incoming.text,
    await activeWhispers(id)
  );

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
