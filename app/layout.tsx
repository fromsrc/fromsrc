import type { Metadata, Viewport } from "next"
import { Instrument_Serif, JetBrains_Mono } from "next/font/google"
import type { ReactNode } from "react"
import "katex/dist/katex.min.css"
import "./globals.css"

const mono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
})

const serif = Instrument_Serif({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-serif",
	display: "swap",
})

export const metadata: Metadata = {
	title: { default: "fromsrc", template: "%s | fromsrc" },
	description: "MDX docs framework. AI-native. Open source.",
	metadataBase: new URL("https://fromsrc.com"),
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://fromsrc.com",
		siteName: "fromsrc",
		title: "fromsrc",
		description: "MDX docs framework. AI-native. Open source.",
		images: [{ url: "/og.png", width: 1200, height: 630, alt: "fromsrc" }],
	},
	twitter: {
		card: "summary_large_image",
		title: "fromsrc",
		description: "MDX docs framework. AI-native. Open source.",
		images: ["/og.png"],
	},
}

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#0a0a0a",
}

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className={`${mono.variable} ${serif.variable}`}>{children}</body>
		</html>
	)
}
