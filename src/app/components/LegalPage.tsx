import type { ReactNode } from "react";

/**
 * The frame the three policy pages share.
 *
 * They exist because Meta will not let an app go Live without a Privacy
 * Policy, Terms and Data Deletion URL, and it checks that each one loads.
 * Plain prose on purpose — a policy that has to be decoded is not one anybody
 * has really been given.
 */
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-[760px] px-6 py-16 wide:py-24">
      <h1 className="font-disp text-[clamp(28px,5vw,44px)] uppercase leading-none">{title}</h1>
      <p className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.14em] text-smoke">
        Last updated {updated}
      </p>
      <div
        className="
          mt-10 space-y-5 text-[15px] leading-relaxed
          [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-signal
          [&_h2]:mt-12 [&_h2]:font-disp [&_h2]:text-[17px] [&_h2]:uppercase
          [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1
          [&_strong]:font-semibold
          [&_ul]:space-y-2
        "
      >
        {children}
      </div>
    </main>
  );
}
