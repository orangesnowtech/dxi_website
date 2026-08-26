import { firestore } from "@/lib/firebase/admin";
import { MAX_HOUSE_RULES_LENGTH, type BotHouseRules } from "@/lib/bot/types";

/**
 * The assistant's standing rules.
 *
 * One document, deliberately. The alternative — a rules collection with an
 * order and an enabled flag each — is a lot of machinery for something whose
 * whole appeal is that somebody can open a box, type a sentence, and have the
 * next reply obey it.
 */

export const BOT_SETTINGS_COLLECTION = "botSettings";
export const HOUSE_RULES_DOC = "houseRules";

const docRef = () => firestore.collection(BOT_SETTINGS_COLLECTION).doc(HOUSE_RULES_DOC);

const EMPTY: BotHouseRules = { text: "", updatedAt: null, updatedBy: "" };

export async function getHouseRules(): Promise<BotHouseRules> {
  const snapshot = await docRef().get();

  if (!snapshot.exists) {
    return EMPTY;
  }

  const data = snapshot.data() as Partial<BotHouseRules>;

  return {
    text: (data.text || "").slice(0, MAX_HOUSE_RULES_LENGTH),
    updatedAt: data.updatedAt || null,
    updatedBy: data.updatedBy || "",
  };
}

/**
 * What the agent asks for on every turn.
 *
 * Never throws. Rules that cannot be read are rules the bot answers without,
 * which is the same behaviour as none being set — and far better than a
 * customer getting an error because a settings document was unreachable.
 */
export async function houseRulesText(): Promise<string> {
  try {
    const rules = await getHouseRules();
    return rules.text;
  } catch (error) {
    console.error("Could not read the assistant's house rules:", error);
    return "";
  }
}

export async function saveHouseRules(text: string, adminEmail: string): Promise<BotHouseRules> {
  const saved: BotHouseRules = {
    text: text.slice(0, MAX_HOUSE_RULES_LENGTH),
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail,
  };

  await docRef().set(saved);

  return saved;
}
