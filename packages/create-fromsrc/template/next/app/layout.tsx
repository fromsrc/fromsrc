import "./globals.css"
import type { ReactNode } from "react"

export const metadata = {
	title: "docs",
	description: "documentation powered by fromsrc",
}

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className="bg-neutral-950 text-neutral-100">{children}</body>
		</html>
	)
}
