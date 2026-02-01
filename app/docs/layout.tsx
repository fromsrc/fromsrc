import type { ReactNode } from "react"
import { Sidebar } from "./_components/sidebar"

export default function DocsLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen bg-bg">
			<Sidebar />
			<main className="flex-1 min-w-0">{children}</main>
		</div>
	)
}
