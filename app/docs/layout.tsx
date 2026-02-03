import type { ReactNode } from "react"
import { KeyboardNav } from "./_components/keyboard"
import { MobileNavigation } from "./_components/mobilenav"
import { SearchModal } from "./_components/search"
import { Sidebar } from "./_components/sidebar"
import { getAllDocs } from "./_lib/content"

export default async function DocsLayout({ children }: { children: ReactNode }) {
	const docs = await getAllDocs()
	return (
		<>
			<MobileNavigation />
			<SearchModal docs={docs} />
			<div className="flex min-h-screen bg-bg">
				<KeyboardNav docs={docs} />
				<div className="hidden lg:block">
					<Sidebar />
				</div>
				<main className="flex-1 min-w-0">{children}</main>
			</div>
		</>
	)
}
