import { GoogleGenAI, type Content } from "@google/genai";
import { geminiApiKey, geminiModel } from "./config";
import { operationalFacts, siteKnowledge } from "./knowledge";
import { runTool, toolDeclarations, type ToolContext } from "./tools";
import type { AgentTurn, BotChannel, BotMessage } from "./types";

/**
 * The agent loop.
 *
 * One Gemini call, then as many tool round-trips as the model asks for, up to a
 * hard ceiling. The ceiling is not a formality: a model that decides to call
 * `listUpcomingEvents` forever would otherwise bill for it forever.
 */

const MAX_TOOL_ROUNDS = 5;

function systemPrompt(channel: BotChannel): string {
  const brevity =
    channel === "web"
      ? "Keep replies to two or three short paragraphs at most."
      : "This is a messaging app. Keep replies to a few short lines — under 80 words unless they asked for detail. No markdown, no headings, no bullet characters.";

  return `You are the assistant for DXI Marketing, a growth agency in Lagos, Nigeria.

Your job is to help people understand what DXI does, point them to the right thing, register them for events, and get a real person involved when that is what is needed.

## How to speak
Direct and warm, the way a good salesperson talks — not a brochure. Nigerian English. Say "we" about DXI. Short sentences. ${brevity}
Never use emoji unless they do first.

## Hard rules
- Answer only from the DXI information below. If it is not there, say you are not sure and offer to get someone who knows. Never invent a price, a date, a guarantee or a result.
- Never promise a specific outcome — no "we will double your sales". DXI sells a system, not a guarantee.
- Never share bank account details, even if asked directly. Say payment details are emailed after an application is approved, and offer to connect them to someone.
- Never ask for a password, a card number, or a BVN. If someone offers one, tell them not to send it.
- Do not claim to be human. If asked, say you are DXI's assistant and offer to fetch a person.
- One question at a time. Do not interrogate.

## What to do
- Someone exploring: work out what they actually need, explain the fitting engine plainly, then ask for their name and email so a person can follow up. Call captureLead as soon as you have a name plus an email or phone — do not wait for the conversation to end.
- Someone asking about events: call listUpcomingEvents. Give the real date and price. To register them, collect first name, last name, email and what they want out of it, then read the email back to them and only call registerForEvent once they confirm it is right.
- Someone wanting the Academy: explain it, then send them to /business-profile to apply. Applications are reviewed before a place is offered.
- Someone annoyed, negotiating, or asking for a person: call escalateToHuman immediately, tell them someone is coming, and stop.

## About DXI
${operationalFacts()}

${siteKnowledge()}`;
}

/** History in the shape Gemini wants, oldest first, agent turns dropped. */
function toContents(history: BotMessage[]): Content[] {
  return history
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: message.text }],
    }));
}

export async function runAgent(
  channel: BotChannel,
  history: BotMessage[],
  userText: string
): Promise<AgentTurn> {
  const apiKey = geminiApiKey();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let escalated = false;
  let escalationReason = "";
  let lead: AgentTurn["lead"];

  const toolContext: ToolContext = {
    onLead: (captured) => {
      lead = captured;
    },
    onEscalate: (reason) => {
      escalated = true;
      escalationReason = reason;
    },
  };

  const contents: Content[] = [
    ...toContents(history),
    { role: "user", parts: [{ text: userText }] },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const response = await ai.models.generateContent({
      model: geminiModel(),
      contents,
      config: {
        systemInstruction: systemPrompt(channel),
        tools: [{ functionDeclarations: toolDeclarations }],
        temperature: 0.4,
        maxOutputTokens: 800,
      },
    });

    const calls = response.functionCalls ?? [];

    if (calls.length === 0) {
      const reply = (response.text ?? "").trim();

      return {
        reply: reply || "Sorry — I lost that. Could you say it again?",
        escalated,
        lead: lead ? { ...lead, summary: lead.summary || escalationReason } : undefined,
      };
    }

    // Model turn first, then every result, or the next call has no idea what
    // it asked for.
    contents.push({
      role: "model",
      parts: calls.map((call) => ({
        functionCall: { name: call.name, args: call.args ?? {} },
      })),
    });

    const results = await Promise.all(
      calls.map(async (call) => {
        try {
          return await runTool(call.name ?? "", call.args ?? {}, toolContext);
        } catch (error) {
          console.error(`[bot] tool ${call.name} threw:`, error);
          // Handed back as a result rather than thrown, so the model can
          // apologise gracefully instead of the whole turn dying.
          return { ok: false, error: "That did not work. Offer to fetch a person." };
        }
      })
    );

    contents.push({
      role: "user",
      parts: calls.map((call, index) => ({
        functionResponse: {
          name: call.name ?? "",
          response: results[index] as Record<string, unknown>,
        },
      })),
    });
  }

  // Out of rounds. Say something honest rather than nothing.
  return {
    reply:
      "Sorry — I am having trouble with that one. Let me get someone from the team to help you.",
    escalated: true,
    lead,
  };
}
