import type { Metadata } from "next";
import { Archivo, Archivo_Black, IBM_Plex_Mono } from "next/font/google";
import { getSiteSettings } from "@/lib/data";
import { botIsConfigured } from "@/lib/bot/config";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import Analytics from "./components/Analytics";
import ConsentBanner from "./components/ConsentBanner";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-archivo",
  display: "swap",
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-archivo-black",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dximarketing.com"),
  title: {
    default: "DXI Marketing — Grow Like It's a System.",
    template: "%s — DXI Marketing",
  },
  description:
    "A Lagos growth agency that finds your customers, talks to them, and closes them — run as a machine you can measure. Four engines, one academy.",
  icons: {
    icon: [
      { url: "/images/dxi-logo-black.jpeg", type: "image/jpeg" },
      { url: "/images/dxi-logo-black.jpeg", sizes: "32x32", type: "image/jpeg" },
      { url: "/images/dxi-logo-black.jpeg", sizes: "16x16", type: "image/jpeg" },
    ],
    apple: [{ url: "/images/dxi-logo-black.jpeg", type: "image/jpeg" }],
    shortcut: ["/images/dxi-logo-black.jpeg"],
  },
  openGraph: {
    title: "DXI Marketing — Grow Like It's a System.",
    description:
      "A Lagos growth agency that finds your customers, talks to them, and closes them — run as a machine you can measure.",
    images: [
      {
        url: "/images/dxilogo.png",
        width: 1200,
        height: 630,
        alt: "DXI Marketing",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DXI Marketing — Grow Like It's a System.",
    description:
      "A Lagos growth agency that finds your customers, talks to them, and closes them — run as a machine you can measure.",
    images: ["/images/dxilogo.png"],
  },
};

/**
 * Nav and footer are fetched once here rather than per page, so every route —
 * including the business profile form and the admin dashboard, which are client
 * components and cannot fetch from Sanity themselves — gets the same chrome.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    // The font variables must sit on <html>, not <body>. The `--font-disp` /
    // `--font-body` / `--font-mono` theme tokens are declared on :root and
    // reference these, and a custom property is substituted at the element it
    // is declared on — from :root, variables defined on <body> are invisible,
    // so every token would silently fall back to Arial.
    <html
      lang="en"
      className={`${archivo.variable} ${archivoBlack.variable} ${plexMono.variable}`}
    >
      <body className="font-body antialiased">
        <Nav settings={settings} />
        {children}
        <Footer settings={settings} />
        {/*
          Checked on the server so an unconfigured deployment ships no widget
          at all, rather than a bubble that opens onto an apology.
        */}
        {botIsConfigured() && <ChatWidget />}
        {/*
          Renders nothing. Starts itself only on the live domain, so the team
          testing on preview does not land in the same reports as customers.
        */}
        <Analytics />
        <ConsentBanner />
      </body>
    </html>
  );
}
