import type { ReactNode } from "react"
import { Sidebar } from "./_components/sidebar"

export default function DocsLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-bg">
			<div className="flex w-full">
				<Sidebar />
				<main className="flex-1 min-w-0 flex">{children}</main>
			</div>
		</div>
	)
}
