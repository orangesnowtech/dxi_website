import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DXI Marketing",
  description: "Digital Experiences and Integrated Marketing",
  icons: {
    // Favicon for browser tabs
    icon: [
      {
        url: "/images/dxi-logo-black.jpeg",
        type: "image/jpeg",
      },
      {
        url: "/images/dxi-logo-black.jpeg",
        sizes: "32x32",
        type: "image/jpeg",
      },
      {
        url: "/images/dxi-logo-black.jpeg",
        sizes: "16x16",
        type: "image/jpeg",
      },
    ],
    apple: [
      {
        url: "/images/dxi-logo-black.jpeg",
        type: "image/jpeg",
      },
    ],
    shortcut: ["/images/dxi-logo-black.jpeg"],
  },
  // Open Graph for social media sharing (dark logo - visible on white backgrounds)
  openGraph: {
    title: "DXI Marketing",
    description: "Digital Experiences and Integrated Marketing",
    images: [
      {
        url: "/images/dxilogo.png",
        width: 1200,
        height: 630,
        alt: "DXI Marketing Logo",
      },
    ],
    type: "website",
  },
  // Twitter Card for Twitter/X sharing
  twitter: {
    card: "summary_large_image",
    title: "DXI Marketing",
    description: "Digital Experiences and Integrated Marketing",
    images: ["/images/dxilogo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased`}>{children}</body>
    </html>
  );
}
