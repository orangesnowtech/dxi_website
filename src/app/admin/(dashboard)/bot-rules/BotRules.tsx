"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_HOUSE_RULES_LENGTH, type BotHouseRules } from "@/lib/bot/types";
import styles from "../../admin.module.css";

const PLACEHOLDER = `Never quote a price for Market Force — it is always scoped on a call.

If someone asks about the Academy and says they are pre-revenue, tell them plainly it is built for businesses already selling something.

Anyone asking about jobs or internships: take their name and email and say we will be in touch. Do not promise an interview.`;

export default function BotRules() {
  const router = useRouter();
  const [text, setText] = useState("");
  /** What is stored, so the Save button knows whether anything changed. */
  const [saved, setSaved] = useState<BotHouseRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/bot-rules");

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load the rules");
      }

      setSaved(data.rules);
      setText(data.rules.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/bot-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save the rules");
      }

      setSaved(data.rules);
      setNotice(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  const dirty = saved !== null && text !== saved.text;
  const tooLong = text.length > MAX_HOUSE_RULES_LENGTH;

  const lastEdited =
    saved?.updatedAt && saved.text
      ? `Last edited by ${saved.updatedBy || "someone"} on ${new Date(
          saved.updatedAt
        ).toLocaleString("en-NG")}`
      : "Nothing set — the assistant is running on its built-in rules only.";

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Bot Rules</h1>
          <p className={styles.subtitle}>
            Standing instructions for the assistant, in your own words. They apply to every
            conversation on every channel, and take effect on the very next reply — no deploy,
            no waiting. Write them the way you would brief a new person on their first day:
            one instruction per line, plainly, and say what to do rather than what not to do
            where you can.
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {notice && <div className={styles.success}>{notice}</div>}

        {loading ? (
          <div className={styles.loading}>Loading the rules…</div>
        ) : (
          <form onSubmit={handleSave} className={styles.codeForm}>
            <h2 className={styles.codeFormTitle}>Standing rules</h2>

            <div className={styles.codeField}>
              <textarea
                id="houseRules"
                className={styles.grantInput}
                style={{ minHeight: 320, resize: "vertical", lineHeight: 1.6 }}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={PLACEHOLDER}
                aria-label="Standing rules for the assistant"
              />
              <span className={styles.codeHint} style={{ color: tooLong ? "#ef4444" : undefined }}>
                {text.length} / {MAX_HOUSE_RULES_LENGTH} characters
                {tooLong ? " — too long to save." : ""} · Every character is re-sent on every
                message, so keep it to the rules that actually change what the bot says.
              </span>
            </div>

            <div className={styles.codeFormActions}>
              <button type="submit" disabled={busy || !dirty || tooLong} className={styles.loginBtn}>
                {busy ? "Saving…" : dirty ? "Save rules" : "Saved"}
              </button>
              {dirty && (
                <button
                  type="button"
                  onClick={() => setText(saved?.text ?? "")}
                  className={styles.paginationBtn}
                >
                  Undo changes
                </button>
              )}
            </div>

            <p className={styles.codeHint} style={{ marginTop: 14 }}>
              {lastEdited}
            </p>
          </form>
        )}

        <div className={styles.codeForm}>
          <h2 className={styles.codeFormTitle}>What these can and cannot do</h2>
          <p className={styles.codeHint}>
            The customer never sees these and is never told they exist. They sit underneath the
            assistant&rsquo;s built-in safety rules and cannot override them — an instruction to
            share bank details, promise a specific result, or claim to be human is ignored, and
            the rest of the rule still applies. Where a rule here disagrees with a whisper on a
            single conversation, the whisper wins: whoever is watching that conversation knows
            something these rules cannot.
          </p>
          <p className={styles.codeHint} style={{ marginTop: 10 }}>
            Emptying the box and saving switches them off entirely.
          </p>
        </div>
      </main>
    </div>
  );
}
