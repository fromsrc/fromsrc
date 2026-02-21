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
			<MobileNavigation />
			<SearchModal />
			<Shortcuts />
			<HeadingCopy />
			<div className="flex min-h-screen bg-bg">
				<KeyboardNav docs={docs} />
				<div className="hidden lg:contents">
					<Sidebar />
				</div>
				<main id="main" className="flex-1 min-w-0">{children}</main>
			</div>
		</>
	)
}
