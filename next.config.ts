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
