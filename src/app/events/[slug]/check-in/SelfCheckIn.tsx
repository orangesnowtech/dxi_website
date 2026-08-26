"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ACCESS_CODE_LENGTH, normalizeAccessCode } from "@/lib/events";

type Done = { firstName: string; typeLabel: string };

function CheckInForm({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  /** Guards the one-shot auto-submit so a failure is not retried in a loop. */
  const autoSubmitted = useRef(false);

  const submit = async (value: string) => {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/events/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, accessCode: value }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We could not check you in.");
      }

      setDone({ firstName: data.firstName, typeLabel: data.typeLabel });
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not check you in.");
    } finally {
      setBusy(false);
    }
  };

  /**
   * The ticket email links here with the code attached, so arriving from it
   * checks someone straight in — one tap at a door rather than reading six
   * characters off one screen and typing them into another.
   */
  useEffect(() => {
    const fromLink = normalizeAccessCode(searchParams.get("code") || "");

    if (fromLink.length === ACCESS_CODE_LENGTH && !autoSubmitted.current) {
      autoSubmitted.current = true;
      setCode(fromLink);
      submit(fromLink);
    } else {
      inputRef.current?.focus();
    }
    // Deliberately runs once: re-firing on every param change would resubmit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) {
    return (
      <div className="border-2 border-ink bg-paper p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-free text-[32px] leading-none text-white">
          ✓
        </div>
        <h2 className="mb-2 font-disp text-[clamp(24px,3.6vw,36px)] uppercase leading-none">
          You&rsquo;re in, {done.firstName}
        </h2>
        <p className="text-[15.5px] text-smoke">
          Checked in as {done.typeLabel}. Enjoy it.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.length === ACCESS_CODE_LENGTH) submit(code);
      }}
      className="border-2 border-ink bg-paper p-8"
    >
      <label
        htmlFor="accessCode"
        className="mb-2 block font-mono text-[13px] font-medium tracking-[0.02em]"
      >
        Your entry code
      </label>

      <input
        id="accessCode"
        ref={inputRef}
        value={code}
        onChange={(e) => {
          setCode(normalizeAccessCode(e.target.value));
          setError(null);
        }}
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        maxLength={ACCESS_CODE_LENGTH}
        placeholder="K7P2QM"
        className="w-full border-2 border-line bg-paper px-4 py-4 text-center font-mono text-[30px] font-bold tracking-[0.3em] text-ink uppercase transition-colors focus:border-signal focus:outline-none"
      />

      <p className="mt-2.5 text-[12.5px] text-smoke">
        The {ACCESS_CODE_LENGTH}-character code from your confirmation email.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-5 border-l-[3px] border-signal bg-ash px-5 py-4 text-[14.5px] text-[#333]"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy || code.length !== ACCESS_CODE_LENGTH}
        className="mt-6 w-full bg-signal px-[30px] py-[18px] font-mono text-sm tracking-[0.04em] text-white transition-colors hover:bg-signal-hover disabled:cursor-not-allowed disabled:bg-smoke"
      >
        {busy ? "Checking you in…" : "Check in"}
      </button>
    </form>
  );
}

export default function SelfCheckIn({ slug }: { slug: string }) {
  // useSearchParams needs a Suspense boundary to avoid opting the whole route
  // into client-side rendering.
  return (
    <Suspense fallback={null}>
      <CheckInForm slug={slug} />
    </Suspense>
  );
}
