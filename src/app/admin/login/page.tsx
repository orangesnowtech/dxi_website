"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getRedirectResult, signInWithRedirect, signOut } from "firebase/auth";
import {
  getFirebaseAuth,
  getGoogleProvider,
  isFirebaseClientConfigured,
} from "@/lib/firebase/client";
import styles from "../admin.module.css";

/** Only ever bounce back to an in-app admin path. */
function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) {
    return "/admin";
  }

  return value === "/admin/login" ? "/admin" : value;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** True until we know whether this load is a return trip from Google. */
  const [resolving, setResolving] = useState(true);

  /**
   * Trades a Firebase credential for our own session cookie.
   *
   * Shared by the redirect handler below; the cookie is what the proxy and
   * every /api/admin route actually check, so sign-in is not finished until
   * this succeeds.
   */
  const startSession = useCallback(
    async (idToken: string) => {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Not on the allowlist — drop the client session too so the next
        // attempt starts clean rather than reusing the rejected account.
        await signOut(getFirebaseAuth()).catch(() => {});
        throw new Error(data.error || "Sign-in failed.");
      }

      router.replace(safeNextPath(searchParams.get("next")));
      router.refresh();
    },
    [router, searchParams]
  );

  /**
   * Completes a redirect sign-in.
   *
   * Runs on every load: `getRedirectResult` returns null on a normal visit and
   * the credential when Google has just sent the browser back here, so the
   * same effect covers both without needing a flag in the URL.
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const credential = await getRedirectResult(getFirebaseAuth());

        if (!credential) {
          if (!cancelled) setResolving(false);
          return;
        }

        // Deliberately leaves `resolving` true — the navigation is already on
        // its way and flashing the sign-in button first would invite a second
        // click that starts the whole dance again.
        await startSession(await credential.user.getIdToken());
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
        setResolving(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [startSession]);

  /**
   * Sends the whole tab to Google rather than opening a popup.
   *
   * A popup is a second browsing context, and a browser is free to make it a
   * background tab instead of a window — Chrome on macOS does. It then freezes
   * that tab and closes its IndexedDB connection, which is the "database is
   * closing" failure: Firebase Auth keeps its handshake state in IndexedDB and
   * finds it gone. Focusing the tab by hand un-freezes it and the sign-in
   * completes, which is the tell. Redirecting the current tab means there is
   * no second context to be hidden, throttled or frozen.
   */
  const handleSignIn = async () => {
    setBusy(true);
    setError(null);

    try {
      await signInWithRedirect(getFirebaseAuth(), getGoogleProvider());
      // Nothing after this runs — the browser is already leaving the page.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
      setBusy(false);
    }
  };

  if (!isFirebaseClientConfigured) {
    return (
      <p className={styles.loginError}>
        Sign-in is not configured. Set NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN and NEXT_PUBLIC_FIREBASE_PROJECT_ID.
      </p>
    );
  }

  return (
    <>
      <button
        onClick={handleSignIn}
        disabled={busy || resolving}
        className={styles.loginBtn}
      >
        {resolving ? "Checking…" : busy ? "Redirecting to Google…" : "Continue with Google"}
      </button>
      {error && <p className={styles.loginError}>{error}</p>}
    </>
  );
}

export default function AdminLoginPage() {
  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>DXI Admin</h1>
        <p className={styles.loginSubtitle}>
          Staff access only. Sign in with an approved DXI account.
        </p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
