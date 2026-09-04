/**
 * Loom.
 *
 * The video layer, and deliberately the whole of it. An earlier draft of this
 * feature had a provider interface with signed, expiring HLS URLs behind it;
 * Loom does not work that way, and pretending otherwise would have meant an
 * abstraction whose main method no implementation could honour.
 *
 * What Loom gives us is an embed id. What that means for the gate is worth
 * being blunt about, because it decides how the rest of the feature behaves:
 *
 *   A Loom embed id is a **secret, not a key**. Anyone holding it can watch,
 *   forever, from anywhere. So the whole of our protection is refusing to put
 *   the id on the page until the server has checked who is asking. It never
 *   appears in the HTML, never in the library listing, never in an API
 *   response to someone who failed the gate.
 *
 * That is real — a page source with no id in it cannot be shared past the
 * gate — and it is also not a lock. Somebody who watches can copy the iframe
 * URL out of their own devtools and pass it on. For a paid replay the honest
 * defence is the watch log plus a closing date, not cryptography. Set the
 * Loom video's own privacy so it needs the link, and treat the id the way you
 * would treat the recording itself.
 */

/** Loom ids are 32 lowercase hex characters. */
const LOOM_ID = /[0-9a-f]{32}/i;

/** The shape a pasted embed carries: `padding-bottom: 64.9038…%`. */
const PADDING_BOTTOM = /padding-bottom:\s*([\d.]+)%/i;

/** 16:9, for a paste that carried no ratio of its own. */
export const DEFAULT_ASPECT_PERCENT = 56.25;

export type ParsedLoom = {
  videoId: string;
  /**
   * Height as a percentage of width, straight out of the pasted embed, or
   * null when the paste carried no ratio — a bare id or a share link.
   *
   * Loom records whatever shape the screen was, so this is rarely 16:9 — the
   * first one we were handed is 64.9%. Keeping the number the embed came with
   * is what stops the player letterboxing every replay.
   *
   * Null rather than a default on purpose. It lets an edit tell "this paste
   * says nothing about the shape" apart from "this paste says 16:9", so
   * re-saving a replay by its id alone cannot silently squash a video that
   * was pasted in full the first time.
   */
  aspectPercent: number | null;
};

/**
 * Reads whatever was pasted into the admin form.
 *
 * Takes the full embed snippet, a share link, an embed link or a bare id,
 * because all four are things a person reasonably copies out of Loom and
 * none of them is worth a support message.
 */
export function parseLoomEmbed(input: string): ParsedLoom | null {
  const value = (input || "").trim();

  if (!value) {
    return null;
  }

  const id = value.match(LOOM_ID);

  if (!id) {
    return null;
  }

  const padding = value.match(PADDING_BOTTOM);
  const parsed = padding ? Number(padding[1]) : NaN;

  // A ratio outside this range is a mis-paste, not a tall video; ignoring it
  // beats rendering a player one pixel high or twelve screens tall.
  const usable = Number.isFinite(parsed) && parsed >= 20 && parsed <= 250;

  return { videoId: id[0].toLowerCase(), aspectPercent: usable ? parsed : null };
}

/**
 * The URL the iframe points at, once someone has earned it.
 *
 * The `hide_*` parameters strip Loom's own chrome: the owner's avatar, the
 * title bar and — the one that matters — the share and copy-link buttons. It
 * is a gated replay; the player should not offer a one-click way to pass it
 * on. None of this is enforcement, only the absence of an invitation.
 */
export function loomEmbedUrl(videoId: string) {
  const params = new URLSearchParams({
    hide_owner: "true",
    hide_share: "true",
    hide_title: "true",
    hideEmbedTopBar: "true",
  });

  return `https://www.loom.com/embed/${videoId}?${params.toString()}`;
}
