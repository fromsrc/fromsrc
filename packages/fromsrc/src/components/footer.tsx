"use client"

import { memo } from "react"

export interface FooterProps {
	columns?: { title: string; links: { label: string; href: string }[] }[]
	copyright?: string
	className?: string
}

export const Footer = memo(function Footer({ columns, copyright, className }: FooterProps) {
	return (
		<footer
			className={`border-t border-line bg-surface px-6 py-10 ${className ?? ""}`}
		>
			{columns && columns.length > 0 && (
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:auto-cols-fr md:grid-flow-col">
					{columns.map((col) => (
						<div key={col.title}>
							<p className="text-sm font-bold text-fg">{col.title}</p>
							<ul className="mt-3 flex flex-col gap-2">
								{col.links.map((link) => (
									<li key={link.href}>
										<a
											href={link.href}
											className="text-sm text-muted transition-colors hover:text-fg"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			)}
			{copyright && (
				<p className="mt-8 text-xs text-dim">{copyright}</p>
			)}
		</footer>
	)
})
