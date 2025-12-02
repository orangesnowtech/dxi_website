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
    icon: [
      {
        url: "/images/dxilogo.png",
        type: "image/png",
      },
      {
        url: "/images/dxilogo.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/images/dxilogo.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/images/dxilogo.png",
        type: "image/png",
      },
    ],
    shortcut: ["/images/dxilogo.png"],
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
