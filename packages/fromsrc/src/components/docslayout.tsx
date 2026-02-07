"use client"

import { type ReactNode, memo } from "react"

export interface DocsLayoutProps {
	children: ReactNode
	sidebar?: ReactNode
	toc?: ReactNode
	header?: ReactNode
	footer?: ReactNode
	className?: string
}

export const DocsLayout = memo(function DocsLayout({
	children,
	sidebar,
	toc,
	header,
	footer,
	className,
}: DocsLayoutProps) {
	return (
		<div className={`min-h-screen flex flex-col ${className ?? ""}`}>
			{header}
			<div className="flex flex-1">
				{sidebar && (
					<aside className="hidden lg:block w-64 shrink-0">{sidebar}</aside>
				)}
				<main className="flex-1 max-w-3xl mx-auto px-6 py-8">{children}</main>
				{toc && (
					<aside className="hidden xl:block w-56 shrink-0">{toc}</aside>
				)}
			</div>
			{footer}
		</div>
	)
})
