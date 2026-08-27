"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  HOW_DID_YOU_HEAR_OPTIONS,
  formatFee,
  seatsLeft,
  type PublicEvent,
  type RegistrationStatus,
  type RegistrationType,
} from "@/lib/events";
import {
  Conditional,
  Field,
  Frame,
  Hint,
  Label,
  Row,
  SectionLabel,
  Select,
  TextArea,
  TextInput,
} from "@/app/components/ui/FormControls";
import Eyebrow from "@/app/components/ui/Eyebrow";
import { trackEventRegistration } from "@/lib/analytics";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organizationName: string;
  jobTitle: string;
  socialMediaUrl: string;
  howDidYouHear: string;
  expectations: string;
  notes: string;
  businessName: string;
  offering: string;
  boothPreference: string;
  repCount: string;
};

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  organizationName: "",
  jobTitle: "",
  socialMediaUrl: "",
  howDidYouHear: "",
  expectations: "",
  notes: "",
  businessName: "",
  offering: "",
  boothPreference: "",
  repCount: "",
};

const boothPreferences = [
  "Standard booth",
  "Corner booth",
  "Premium / island booth",
  "Table only",
  "No preference",
];

const repCounts = ["1", "2", "3", "4", "5 or more"];

type Outcome = {
  status: RegistrationStatus;
  accessCode: string | null;
  feeNaira: number;
};

export default function RegistrationForm({ event }: { event: PublicEvent }) {
  // A single available type is preselected — making somebody choose between
  // one option is a click that teaches them nothing.
  const openTypes = event.registrationTypes.filter((type) => seatsLeft(event, type) !== 0);

  const [typeKey, setTypeKey] = useState(openTypes.length === 1 ? openTypes[0].key : "");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const selected = useMemo(
    () => event.registrationTypes.find((type) => type.key === typeKey),
    [event.registrationTypes, typeKey]
  );

  const isVendor = selected?.profile === "vendor";

  const setField = (field: keyof FormState, value: string) =>
    setForm((previous) => ({ ...previous, [field]: value }));

  const handleSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();

    if (!selected) {
      setError("Choose how you would like to attend.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: event.slug,
          typeKey: selected.key,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          organizationName: form.organizationName,
          jobTitle: form.jobTitle,
          socialMediaUrl: form.socialMediaUrl,
          howDidYouHear: form.howDidYouHear,
          expectations: form.expectations,
          notes: form.notes,
          vendor: isVendor
            ? {
                businessName: form.businessName,
                offering: form.offering,
                boothPreference: form.boothPreference,
                repCount: form.repCount,
              }
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We could not complete your registration.");
      }

      setOutcome({
        status: data.status as RegistrationStatus,
        accessCode: data.accessCode ?? null,
        feeNaira: data.feeNaira ?? 0,
      });

      // After the place is actually held, never on submit: counting attempts
      // as registrations would inflate the one number the events are judged on.
      trackEventRegistration({
        eventSlug: event.slug,
        typeKey: selected.key,
        status: String(data.status),
        feeNaira: Number(data.feeNaira ?? 0),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  if (outcome) {
    return <Success outcome={outcome} email={form.email} />;
  }

  if (openTypes.length === 0) {
    return (
      <div className="mx-auto max-w-[760px] border-2 border-ink bg-ash p-10 text-center">
        <h2 className="mb-3 font-disp text-[clamp(24px,3.4vw,36px)] uppercase leading-none">
          Fully booked
        </h2>
        <p className="text-[16px] text-smoke">
          Every place at this event has gone. Keep an eye on the events page for the next one.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[840px]" noValidate={false}>
      <div className="mb-[46px] max-w-[720px]">
        <Eyebrow>Registration</Eyebrow>
        <h2 className="mb-[14px] font-disp text-[clamp(28px,4vw,44px)] uppercase leading-none tracking-[-0.01em]">
          Take your place
        </h2>
        <p className="text-[16.5px] text-smoke">
          A couple of minutes. We only ask for what we need to get you in the room and follow up
          properly afterwards.
        </p>
      </div>

      <SectionLabel tag="A">How you are attending</SectionLabel>

      <div className="mb-9 grid grid-cols-1 gap-4 wide:grid-cols-2">
        {event.registrationTypes.map((type) => (
          <TypeOption
            key={type.key}
            type={type}
            event={event}
            checked={typeKey === type.key}
            onSelect={() => setTypeKey(type.key)}
          />
        ))}
      </div>

      {selected && selected.feeNaira > 0 && (
        <Frame>
          This place is <strong>{formatFee(selected.feeNaira)}</strong>.{" "}
          {selected.requiresApproval
            ? "We review applications first — if yours is accepted we will email you the bank transfer details. Please do not send any money before then."
            : "We will email you the bank transfer details as soon as you register. Your place is held while you pay."}
        </Frame>
      )}

      {selected?.requiresApproval && selected.feeNaira === 0 && (
        <Frame>
          Places of this kind are reviewed before they are confirmed. We will come back to you
          either way.
        </Frame>
      )}

      <SectionLabel tag="B">About you</SectionLabel>

      <Row>
        <Field half>
          <Label htmlFor="firstName" required>
            First name
          </Label>
          <TextInput
            id="firstName"
            name="firstName"
            value={form.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
            required
            autoComplete="given-name"
          />
        </Field>
        <Field half>
          <Label htmlFor="lastName" required>
            Last name
          </Label>
          <TextInput
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
            required
            autoComplete="family-name"
          />
        </Field>
      </Row>

      <Row>
        <Field half>
          <Label htmlFor="email" required>
            Email address
          </Label>
          <TextInput
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            required
            autoComplete="email"
          />
          <Hint>Your entry code and joining details go here.</Hint>
        </Field>
        <Field half>
          <Label htmlFor="phone">Phone number</Label>
          <TextInput
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            placeholder="0807 000 0000"
          />
          <Hint>Optional. Only used if we need to reach you about the day itself.</Hint>
        </Field>
      </Row>

      <Row>
        <Field half>
          <Label htmlFor="organizationName">Company or organization</Label>
          <TextInput
            id="organizationName"
            name="organizationName"
            value={form.organizationName}
            onChange={(e) => setField("organizationName", e.target.value)}
            autoComplete="organization"
          />
        </Field>
        <Field half>
          <Label htmlFor="jobTitle">What you do there</Label>
          <TextInput
            id="jobTitle"
            name="jobTitle"
            value={form.jobTitle}
            onChange={(e) => setField("jobTitle", e.target.value)}
            placeholder="Founder, Marketing Lead…"
          />
        </Field>
      </Row>

      <Field>
        <Label htmlFor="socialMediaUrl">Website or social profile</Label>
        <TextInput
          id="socialMediaUrl"
          name="socialMediaUrl"
          value={form.socialMediaUrl}
          onChange={(e) => setField("socialMediaUrl", e.target.value)}
          placeholder="instagram.com/yourbusiness"
        />
        <Hint>Optional. It helps us know who is in the room.</Hint>
      </Field>

      <Conditional when={Boolean(isVendor)}>
        <SectionLabel tag="C">Your stand</SectionLabel>

        <Field>
          <Label htmlFor="businessName" required={isVendor}>
            Business name, as it should appear
          </Label>
          <TextInput
            id="businessName"
            name="businessName"
            value={form.businessName}
            onChange={(e) => setField("businessName", e.target.value)}
            required={isVendor}
          />
          <Hint>This is what goes on your signage and in the programme.</Hint>
        </Field>

        <Field>
          <Label htmlFor="offering" required={isVendor}>
            What will you be showing or selling?
          </Label>
          <TextArea
            id="offering"
            name="offering"
            value={form.offering}
            onChange={(e) => setField("offering", e.target.value)}
            required={isVendor}
            placeholder="Products, services, demos — whatever you are bringing."
          />
        </Field>

        <Row>
          <Field half>
            <Label htmlFor="boothPreference">Booth preference</Label>
            <Select
              id="boothPreference"
              name="boothPreference"
              value={form.boothPreference}
              onChange={(e) => setField("boothPreference", e.target.value)}
              options={boothPreferences}
              placeholder="No preference"
            />
            <Hint>We do our best, but final placement is ours to make.</Hint>
          </Field>
          <Field half>
            <Label htmlFor="repCount">People on your stand</Label>
            <Select
              id="repCount"
              name="repCount"
              value={form.repCount}
              onChange={(e) => setField("repCount", e.target.value)}
              options={repCounts}
              placeholder="Select a number"
            />
          </Field>
        </Row>
      </Conditional>

      <SectionLabel tag={isVendor ? "D" : "C"}>Last thing</SectionLabel>

      <Field>
        <Label htmlFor="howDidYouHear" required>
          How did you hear about this?
        </Label>
        <Select
          id="howDidYouHear"
          name="howDidYouHear"
          value={form.howDidYouHear}
          onChange={(e) => setField("howDidYouHear", e.target.value)}
          options={HOW_DID_YOU_HEAR_OPTIONS}
          required
        />
      </Field>

      <Field>
        <Label htmlFor="expectations" required>
          What do you hope to get out of this?
        </Label>
        <TextArea
          id="expectations"
          name="expectations"
          value={form.expectations}
          onChange={(e) => setField("expectations", e.target.value)}
          required
          placeholder="The problem you want solved, the thing you want to understand, or who you are hoping to meet."
        />
        <Hint>
          We shape the session around these answers, so be specific rather than polite.
        </Hint>
      </Field>

      <Field>
        <Label htmlFor="notes">Anything we should know?</Label>
        <TextArea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
          placeholder="Access needs, dietary requirements, a question you want answered on the day."
        />
      </Field>

      {error && (
        <div
          role="alert"
          className="mb-6 border-l-[3px] border-signal bg-ash px-5 py-4 text-[14.5px] text-[#333]"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy || !selected}
        className="w-full bg-signal px-[30px] py-[18px] font-mono text-sm tracking-[0.04em] text-white transition-colors hover:bg-signal-hover disabled:cursor-not-allowed disabled:bg-smoke wide:w-auto"
      >
        {busy ? "Sending…" : selected?.requiresApproval ? "Submit application" : "Confirm my place"}
      </button>

      <p className="mt-4 text-[12.5px] text-smoke">
        We use these details to run the event and to follow up about DXI. We do not sell them on.
      </p>
    </form>
  );
}

/** One selectable way into the event. */
function TypeOption({
  type,
  event,
  checked,
  onSelect,
}: {
  type: RegistrationType;
  event: PublicEvent;
  checked: boolean;
  onSelect: () => void;
}) {
  const remaining = seatsLeft(event, type);
  const full = remaining === 0;

  return (
    <label
      className={`block cursor-pointer border-2 p-5 transition-colors ${
        full
          ? "cursor-not-allowed border-line bg-ash opacity-60"
          : checked
            ? "border-signal bg-paper"
            : "border-line bg-paper hover:border-ink"
      }`}
    >
      <span className="flex items-start gap-3">
        <input
          type="radio"
          name="typeKey"
          value={type.key}
          checked={checked}
          onChange={onSelect}
          disabled={full}
          required
          className="mt-1 h-4 w-4 accent-[var(--color-signal)]"
        />
        <span className="flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-disp text-[15px] uppercase">{type.label}</span>
            <span
              className={`inline-block px-[7px] py-[2px] font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-white ${
                type.feeNaira > 0 ? "bg-signal" : "bg-free"
              }`}
            >
              {formatFee(type.feeNaira)}
            </span>
            {type.requiresApproval && (
              <span className="inline-block bg-ink px-[7px] py-[2px] font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                Reviewed
              </span>
            )}
          </span>

          {type.description && (
            <span className="mt-1.5 block text-[13.5px] text-smoke">{type.description}</span>
          )}

          {full ? (
            <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.08em] text-signal">
              Fully booked
            </span>
          ) : (
            remaining !== null &&
            remaining <= 10 && (
              <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.08em] text-signal">
                {remaining} left
              </span>
            )
          )}
        </span>
      </span>
    </label>
  );
}

/**
 * What people see after submitting.
 *
 * Three different things happened, so this says three different things. The
 * access code only appears where one has actually been issued — telling a
 * pending applicant a code would read as a ticket they have not got.
 */
function Success({ outcome, email }: { outcome: Outcome; email: string }) {
  const copy =
    outcome.status === "confirmed"
      ? {
          heading: "You're in.",
          body: "Your place is confirmed. We have emailed your entry code and everything you need for the day.",
        }
      : outcome.status === "awaiting_payment"
        ? {
            heading: "Your place is held.",
            body: `We have emailed the bank transfer details to ${email}. Your place is held while you pay — send us the proof of payment by replying to that email and we will confirm you.`,
          }
        : {
            heading: "Application received.",
            body: `Applications of this kind are reviewed before a place is confirmed. We have emailed a copy to ${email} and will come back to you either way.`,
          };

  return (
    <div className="mx-auto max-w-[760px] border-2 border-ink bg-paper p-10 text-center">
      <Eyebrow>Registration</Eyebrow>
      <h2 className="mb-3 font-disp text-[clamp(26px,3.6vw,40px)] uppercase leading-none">
        {copy.heading}
      </h2>
      <p className="mx-auto max-w-[520px] text-[16px] text-smoke">{copy.body}</p>

      {outcome.accessCode && (
        <div className="mx-auto mt-8 max-w-[360px] border-2 border-signal bg-ash p-6">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-smoke">
            Your entry code
          </div>
          <div className="font-mono text-[34px] font-bold tracking-[0.3em] text-ink">
            {outcome.accessCode}
          </div>
        </div>
      )}

      <div className="mt-9 flex flex-wrap justify-center gap-3.5">
        <Link
          href="/events"
          className="inline-block bg-ink px-[30px] py-4 font-mono text-sm tracking-[0.04em] text-white transition-colors hover:bg-ink-hover"
        >
          See other events
        </Link>
        <Link
          href="/"
          className="inline-block bg-transparent px-[30px] py-4 font-mono text-sm tracking-[0.04em] text-ink shadow-[inset_0_0_0_2px_var(--color-ink)] transition-colors hover:bg-ink hover:text-white"
        >
          Back to DXI
        </Link>
      </div>
    </div>
  );
}
