"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

// Only the auth-facing keys are needed here. They are public by design — the
// real gate is the email allowlist checked server-side on every request.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

/**
 * Which origin the sign-in popup runs on.
 *
 * Firebase defaults this to the project's own `*.firebaseapp.com`, which makes
 * every piece of state the popup flow depends on third-party to us. Safari's
 * tracking prevention partitions that storage away, so the popup completes at
 * Google and then has nowhere to hand the credential back — sign-in fails on a
 * Mac while working everywhere else, which is exactly the shape of the bug we
 * hit.
 *
 * Pointing it at our own hostname makes the handler first-party. `/__/auth/*`
 * is rewritten to the real Firebase handler in next.config.ts, so Google still
 * serves the page; it just arrives on our origin. Every host this runs on must
 * therefore be in the Firebase console's authorized domains.
 *
 * This does not silence the "Cross-Origin-Opener-Policy would block the
 * window.closed call" warning — the popup still visits accounts.google.com,
 * which severs the handle from its side, and no configuration of ours reaches
 * that. It fixes the failure, not the noise.
 */
function resolveAuthDomain() {
  if (typeof window !== "undefined" && window.location.hostname) {
    return window.location.hostname;
  }

  return firebaseConfig.authDomain;
}

export function getFirebaseClientApp() {
  return getApps().length > 0
    ? getApp()
    : initializeApp({ ...firebaseConfig, authDomain: resolveAuthDomain() });
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseClientApp());
}

export function getGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

export const isFirebaseClientConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);
