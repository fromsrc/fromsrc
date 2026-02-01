"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import type { DocMeta } from "../content"
import { NavLink } from "./navlink"
import { Search } from "./search"

interface Section {
	title: string
	items: DocMeta[]
}

interface Props {
	title: string
	logo?: ReactNode
	navigation: Section[]
	docs: DocMeta[]
	basePath?: string
	github?: string
}

export function Sidebar({ title, logo, navigation, docs, basePath = "/docs", github }: Props) {
	return (
		<aside className="w-60 shrink-0 border-r border-line h-screen sticky top-0 overflow-y-auto bg-bg">
			<div className="p-5">
				<Link href="/" className="flex items-center gap-2.5 text-sm text-fg hover:text-accent transition-colors">
					<div className="p-1.5 rounded-lg bg-surface border border-line">
						{logo}
					</div>
					{title}
				</Link>
			</div>
			<div className="px-4 mb-6">
				<Search basePath={basePath} docs={docs} />
			</div>
			<nav className="px-4 pb-20">
				{navigation.map((section) => (
					<div key={section.title} className="mb-6">
						<h3 className="px-2 mb-2 text-[11px] text-muted uppercase tracking-wider">
							{section.title}
						</h3>
						<ul className="space-y-0.5">
							{section.items.map((item) => (
								<li key={item.slug}>
									<NavLink href={item.slug ? `${basePath}/${item.slug}` : basePath}>
										{item.title}
									</NavLink>
								</li>
							))}
						</ul>
					</div>
				))}
			</nav>
			{github && (
				<div className="absolute bottom-0 left-0 right-0 p-4 border-t border-line bg-bg">
					<a
						href={github}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 text-xs text-muted hover:text-fg transition-colors"
					>
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path
								fillRule="evenodd"
								d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
								clipRule="evenodd"
							/>
						</svg>
						github
					</a>
				</div>
			)}
		</aside>
	)
}
