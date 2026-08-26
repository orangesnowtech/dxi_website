import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
  // Ensure API routes are not pre-rendered during build
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  /**
   * Admin sign-in uses Firebase's `signInWithPopup`, which has to poll
   * `window.closed` on the popup and then call `window.close()` on it. Under
   * the default opener policy the browser severs that handle as soon as the
   * popup navigates to accounts.google.com, so those calls are blocked and the
   * sign-in promise rejects — the "Cross-Origin-Opener-Policy policy would
   * block the window.closed call" console errors.
   *
   * `same-origin-allow-popups` keeps this document in its own browsing context
   * group while still letting it retain a handle on popups it opened, which is
   * exactly what the popup flow needs. It is also a stricter posture than the
   * `unsafe-none` default, so this is a small security gain rather than a
   * trade-off.
   *
   * Scoped to /admin because that is the only place the site opens a popup.
   */
  /**
   * Serves Firebase's sign-in handler from our own origin.
   *
   * The client sets `authDomain` to whatever host it is running on (see
   * lib/firebase/client.ts), so the popup opens `/__/auth/handler` here rather
   * than on `*.firebaseapp.com`. Google still renders the page — this only
   * changes which origin it arrives on, which is what keeps the flow
   * first-party and out of Safari's partitioned storage.
   *
   * The target is the project's real auth domain, read from the same env var
   * the client used to use, so this follows the project rather than hardcoding
   * it.
   */
  async rewrites() {
    const authHost =
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
      `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`;

    return [
      {
        source: '/__/auth/:path*',
        destination: `https://${authHost}/__/auth/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
