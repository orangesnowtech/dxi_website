"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

// Public by design — the real gate is the email allowlist checked server-side
// on every request.
//
// `appId` and `measurementId` are not needed for sign-in and are here for
// analytics, which will not start without them: the SDK resolves the GA4
// stream from the app id, and silently does nothing when it is absent. That
// silence is why this config carries fields the auth path never reads.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
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
  // Off by default. Serving the handler from our own origin also changes the
  // OAuth redirect_uri to https://<our-host>/__/auth/handler, and Google
  // rejects that with `redirect_uri_mismatch` until the exact URL is listed on
  // the OAuth 2.0 web client in Google Cloud Console — a separate list from
  // Firebase's authorized domains, which is the trap here.
  //
  // To turn it on: add https://<host>/__/auth/handler for every host the app
  // runs on (including localhost:3001) to that client's authorized redirect
  // URIs, then set NEXT_PUBLIC_FIREBASE_SAME_ORIGIN_AUTH=1. The rewrite in
  // next.config.ts is already in place and waiting for it.
  //
  // Worth doing when Safari matters: it keeps the flow first-party, which is
  // what stops tracking prevention partitioning the credential away. Chrome
  // with signInWithRedirect does not need it.
  const sameOrigin = process.env.NEXT_PUBLIC_FIREBASE_SAME_ORIGIN_AUTH === "1";

  if (sameOrigin && typeof window !== "undefined" && window.location.hostname) {
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
