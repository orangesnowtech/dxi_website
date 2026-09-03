import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/app/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What DXI Marketing collects when you message us or use this site, why, how long we keep it, and how to have it deleted.",
};

/**
 * DRAFT — written to be accurate about what this codebase actually does, and
 * to satisfy Meta's App Review requirement. It has not been through a lawyer.
 * Read it against how the business really operates before submitting.
 */
export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" updated="3 September 2026">
      <p>
        This policy covers <strong>dximarketing.com</strong> and the messaging channels DXI
        Marketing answers on — WhatsApp, Facebook Messenger, Instagram Direct, and the chat
        window on this site. DXI Marketing is a growth agency based in Lagos, Nigeria, and is
        the data controller for everything described here.
      </p>

      <h2>What we collect</h2>
      <p>When you message us on any channel, we store:</p>
      <ul>
        <li>
          <strong>Your messages</strong>, and the replies we send back, as one conversation
          thread.
        </li>
        <li>
          <strong>An identifier for you on that channel</strong> — your WhatsApp phone number,
          or the account-scoped id Meta gives us for Messenger and Instagram. On the website it
          is a random id stored in your own browser, which is not linked to your name unless you
          tell us it.
        </li>
        <li>
          <strong>Your public profile name</strong>, where the channel provides it.
        </li>
        <li>
          <strong>Contact details you choose to give us</strong> — usually a name, an email
          address and a phone number, so a person can follow up.
        </li>
      </ul>
      <p>
        If you register for an event or apply to the Academy, we also store what those forms
        ask for. If you fill in nothing and ask nothing, we hold nothing but the conversation.
      </p>
      <p>
        We do not ask for and do not want passwords, card numbers or BVNs. Our assistant is
        instructed to refuse them. Please do not send them.
      </p>

      <h2>Why we hold it</h2>
      <ul>
        <li>To answer you, and to let a colleague pick up where the assistant left off.</li>
        <li>To follow up on an enquiry you asked us to follow up on.</li>
        <li>To register you for an event and let you in at the door.</li>
        <li>To understand, in aggregate, what people ask us — never to profile you.</li>
      </ul>
      <p>
        Our lawful basis is your consent, given by starting the conversation, and our legitimate
        interest in running a business that answers its customers.
      </p>

      <h2>Who else sees it</h2>
      <p>
        Our assistant is built on <strong>Google Gemini</strong>. The text of your message and
        the recent history of your conversation are sent to Google to generate a reply. Google
        processes it as our service provider.
      </p>
      <p>
        Conversations are stored in <strong>Google Firebase</strong>. Messages on WhatsApp,
        Messenger and Instagram travel through <strong>Meta</strong> under Meta&apos;s own
        policies, which we do not control. Event confirmations are sent by email through{" "}
        <strong>ZeptoMail</strong>.
      </p>
      <p>
        These are the only parties. <strong>We do not sell your data, and we do not share it
        with advertisers or data brokers.</strong> We disclose it otherwise only where the law
        requires it.
      </p>
      <p>
        These providers operate outside Nigeria, so your data is transferred and stored abroad.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Conversations are kept for as long as they are useful to answering you and to the
        business relationship, and are reviewed periodically. Event registrations are kept as
        records of the event. You can ask us to delete any of it sooner — see below.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the Nigeria Data Protection Act you may ask us for a copy of what we hold about
        you, ask us to correct it, ask us to delete it, or withdraw your consent. Withdrawing
        consent does not undo what was done before you withdrew it.
      </p>
      <p>
        The fastest route is our{" "}
        <Link href="/data-deletion">data deletion page</Link>, which also explains how to have
        everything erased through Meta itself. Otherwise write to{" "}
        <a href="mailto:privacy@dximarketing.com">privacy@dximarketing.com</a> and we will
        answer within 30 days.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        We use Google Analytics to count visits, and only after you agree to it in the banner on
        your first visit. Decline and no analytics cookies are set. You can change your mind at
        any time using the <strong>Cookie choices</strong> link in the footer.
      </p>

      <h2>Children</h2>
      <p>
        This site and these channels are for people doing business, and are not directed at
        anyone under 18. If you believe a child has sent us information, write to us and we will
        delete it.
      </p>

      <h2>Changes</h2>
      <p>
        We update this page when what we do changes, and the date at the top moves with it.
      </p>

      <h2>Contact</h2>
      <p>
        DXI Marketing, Lagos, Nigeria.
        <br />
        <a href="mailto:privacy@dximarketing.com">privacy@dximarketing.com</a> · 0807 453 3441
      </p>
    </LegalPage>
  );
}
