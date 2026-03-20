import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";

import "katex/dist/katex.min.css";
import "./globals.css";
import { siteurl } from "./_lib/site";

const mono = JetBrains_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-mono",
});

const serif = Instrument_Serif({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
});

const site = siteurl();

export const metadata: Metadata = {
  description: "MDX docs framework. AI-native. Open source.",
  metadataBase: new URL(site),
  openGraph: {
    description: "MDX docs framework. AI-native. Open source.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "fromsrc" }],
    locale: "en_US",
    siteName: "fromsrc",
    title: "fromsrc",
    type: "website",
    url: site,
  },
  title: { default: "fromsrc", template: "%s | fromsrc" },
  twitter: {
    card: "summary_large_image",
    description: "MDX docs framework. AI-native. Open source.",
    images: ["/og.png"],
    title: "fromsrc",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: "#0a0a0a",
  width: "device-width",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${mono.variable} ${serif.variable}`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-surface focus:text-fg focus:border focus:border-line focus:rounded-md focus:text-sm"
        >
          skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
