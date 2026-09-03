import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/app/components/LegalPage";

export const metadata: Metadata = {
  title: "Deleting your data",
  description:
    "How to have DXI Marketing erase your conversation and contact details, and how to check a deletion request.",
};

/**
 * The human-readable half of Meta's data deletion requirement.
 *
 * Meta calls `POST /api/data-deletion` and is handed back a link to this page
 * carrying a confirmation code, so the person who asked can see that something
 * actually happened. That is the only reason the code is echoed here: erasure
 * is done by the time this page renders, and nothing here can undo it.
 */
export default async function DataDeletion({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <LegalPage title="Deleting your data" updated="3 September 2026">
      {code && (
        <div className="border-l-2 border-signal bg-ash px-5 py-4">
          <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-smoke">
            Request received
          </p>
          <p className="mt-2">
            Your deletion request has been processed. Your conversation history and the contact
            details we held from it have been erased from our systems.
          </p>
          <p className="mt-3 font-mono text-[13px] break-all">
            Reference: <strong>{code}</strong>
          </p>
        </div>
      )}

      <p>
        You can have everything we hold about you deleted, and you do not have to give a reason.
        There are two ways to ask.
      </p>

      <h2>Through Meta</h2>
      <p>
        If you have messaged us on WhatsApp, Facebook Messenger or Instagram, you can remove our
        app&apos;s access from your Meta account settings:
      </p>
      <ul>
        <li>
          <strong>Facebook:</strong> Settings &amp; privacy → Settings → Apps and websites →
          find DXI Marketing → Remove.
        </li>
        <li>
          <strong>Instagram:</strong> Settings → Website permissions → Apps and websites → find
          DXI Marketing → Remove.
        </li>
      </ul>
      <p>
        Meta then tells us to delete your data, we do it, and you are shown a reference for the
        request.
      </p>

      <h2>By writing to us</h2>
      <p>
        Email <a href="mailto:privacy@dximarketing.com">privacy@dximarketing.com</a> from the
        address you gave us, or send us a message on the channel you have been talking to us on,
        and say you want your data deleted. We will confirm within 30 days.
      </p>

      <h2>What gets deleted</h2>
      <ul>
        <li>Your conversation with our assistant and our team, on every channel.</li>
        <li>The contact details captured from that conversation.</li>
        <li>The channel identifier we held for you.</li>
      </ul>

      <h2>What does not</h2>
      <p>
        Records we are required to keep — an event you actually attended, an invoice, a signed
        agreement — are retained for as long as the law requires, and no longer. Say so in your
        request if you want to know exactly what is being kept and why.
      </p>
      <p>
        Copies held by Meta inside WhatsApp, Messenger or Instagram itself are governed by
        Meta&apos;s policies, not ours. Deleting a chat there is separate from asking us.
      </p>

      <p>
        What we hold in the first place is set out in our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
