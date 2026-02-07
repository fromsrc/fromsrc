import type { ReactNode } from "react"
import { KeyboardNav } from "./_components/keyboard"
import { MobileNavigation } from "./_components/mobilenav"
import { SearchModal } from "./_components/search"
import { Shortcuts } from "./_components/shortcuts"
import { Sidebar } from "./_components/sidebar"
import { getAllDocs, getSearchDocs } from "./_lib/content"

export default async function DocsLayout({ children }: { children: ReactNode }) {
	const [docs, searchDocs] = await Promise.all([getAllDocs(), getSearchDocs()])
	return (
		<>
			<MobileNavigation />
			<SearchModal docs={searchDocs} />
			<Shortcuts />
			<div className="flex min-h-screen bg-bg">
				<KeyboardNav docs={docs} />
				<div className="hidden lg:block">
					<Sidebar />
				</div>
				<main id="main" className="flex-1 min-w-0">{children}</main>
			</div>
		</>
	)
}
