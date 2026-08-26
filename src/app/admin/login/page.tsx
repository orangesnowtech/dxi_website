"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithPopup, signOut } from "firebase/auth";
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

  const handleSignIn = async () => {
    setBusy(true);
    setError(null);

    const auth = getFirebaseAuth();

    try {
      const credential = await signInWithPopup(auth, getGoogleProvider());
      const idToken = await credential.user.getIdToken();

      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Not on the allowlist — drop the client session too so the next
        // attempt starts clean rather than reusing the rejected account.
        await signOut(auth).catch(() => {});
        throw new Error(data.error || "Sign-in failed.");
      }

      router.replace(safeNextPath(searchParams.get("next")));
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sign-in failed. Please try again.";

      // A closed popup is a normal thing to do, not an error worth shouting about.
      setError(message.includes("auth/popup-closed-by-user") ? null : message);
    } finally {
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
      <button onClick={handleSignIn} disabled={busy} className={styles.loginBtn}>
        {busy ? "Signing in…" : "Continue with Google"}
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
