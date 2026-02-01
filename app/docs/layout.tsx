import type { ReactNode } from "react"
import { Sidebar } from "./_components/sidebar"
import { MobileNavigation } from "./_components/mobilenav"

export default function DocsLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-bg">
			<MobileNavigation />
			<div className="flex w-full">
				<div className="hidden lg:block">
					<Sidebar />
				</div>
				<main className="flex-1 min-w-0 flex">{children}</main>
			</div>
		</div>
	)
}
