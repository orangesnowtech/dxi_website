"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  initAnalytics,
  isMeasurablePath,
  trackPageView,
  trackWhatsAppClick,
} from "@/lib/analytics";
import { onConsentChange } from "@/lib/consent";

/**
 * Starts analytics and keeps it told where the visitor is.
 *
 * Mounted once in the root layout. Renders nothing, and every branch is a
 * no-op when analytics is switched off — on localhost, on the preview backend,
 * or where the browser will not have it.
 */
export default function Analytics() {
  const pathname = usePathname();

  /**
   * Firebase sends a `page_view` of its own the moment analytics starts, so
   * the first render is already counted. Firing ours as well would double
   * every landing page — the one number a marketing site cannot afford to have
   * wrong.
   */
  const startedOn = useRef<string | null>(null);

  useEffect(() => {
    if (!isMeasurablePath(pathname)) {
      return;
    }

    if (startedOn.current === null) {
      startedOn.current = pathname;
      // A no-op until consent is granted; the listener below picks it up then.
      void initAnalytics();
      return;
    }

    // Every navigation after the first. The App Router changes the page
    // without a document load, so nothing else would report it.
    trackPageView(pathname);
  }, [pathname]);

  /**
   * Accepting in the banner has to start measurement there and then.
   *
   * Without this, a visitor who accepts is not counted until they navigate —
   * so the page that actually persuaded them, which is the one worth knowing
   * about, is the one page that goes unrecorded.
   */
  useEffect(
    () =>
      onConsentChange((choice) => {
        if (choice !== "granted") {
          return;
        }

        // Firebase sends its own page_view as it starts, so the current page
        // is counted by this alone — nothing more to fire here.
        void initAnalytics();
      }),
    []
  );

  /**
   * WhatsApp links, caught at the document rather than per button.
   *
   * These are scattered through the nav, the footer, the page content and the
   * Sanity-driven sections — some of them rendered from content the team edits
   * without touching code. One listener catches every one of them, including
   * the ones that do not exist yet.
   */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest?.("a[href*='wa.me/']") as HTMLAnchorElement | null;

      if (link?.href) {
        trackWhatsAppClick(link.href);
      }
    };

    // Capture phase, so a handler that stops propagation upstream does not
    // quietly cost us the measurement.
    document.addEventListener("click", onClick, { capture: true });

    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
