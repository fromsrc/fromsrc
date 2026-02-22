import { HeadingCopy } from "fromsrc/client"
import type { ReactNode } from "react"
import { KeyboardNav } from "./_components/keyboard"
import { MobileNavigation } from "./_components/mobilenav"
import { SearchModal } from "./_components/search"
import { Shortcuts } from "./_components/shortcuts"
import { Sidebar } from "./_components/sidebar"
import { getAllDocs } from "./_lib/content"

export default async function DocsLayout({ children }: { children: ReactNode }) {
	const docs = await getAllDocs()
	return (
		<>
			<a
				href="#main"
				className="fixed left-3 top-3 -translate-y-20 rounded bg-fg px-3 py-2 text-sm text-bg focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-fg focus:ring-offset-2 focus:ring-offset-bg z-50"
			>
				skip to content
			</a>
			<MobileNavigation />
			<SearchModal />
			<Shortcuts />
			<HeadingCopy />
			<div className="flex min-h-screen bg-bg">
				<KeyboardNav docs={docs} />
				<Sidebar />
				<main id="main" className="flex-1 min-w-0">{children}</main>
			</div>
		</>
	)
}
