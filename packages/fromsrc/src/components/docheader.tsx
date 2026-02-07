"use client"

import { memo, type JSX } from "react"

export interface DocHeaderProps {
	title: string
	description?: string
	breadcrumb?: { label: string; href: string }[]
	readingTime?: string
	className?: string
}

function DocHeaderBase({
	title,
	description,
	breadcrumb,
	readingTime,
	className,
}: DocHeaderProps): JSX.Element {
	return (
		<header className={`space-y-3 ${className || ""}`}>
			{breadcrumb && breadcrumb.length > 0 && (
				<nav aria-label="Breadcrumb" className="text-xs text-muted">
					<ol className="flex items-center gap-1.5">
						{breadcrumb.map((item, i) => (
							<li key={item.href} className="flex items-center gap-1.5">
								{i > 0 && (
									<span aria-hidden="true" className="text-dim">
										/
									</span>
								)}
								{i === breadcrumb.length - 1 ? (
									<span aria-current="page" className="text-fg">
										{item.label}
									</span>
								) : (
									<a href={item.href} className="hover:text-fg transition-colors">
										{item.label}
									</a>
								)}
							</li>
						))}
					</ol>
				</nav>
			)}
			<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
			{description && <p className="text-muted text-lg">{description}</p>}
			{readingTime && (
				<span className="block text-dim text-sm">{readingTime}</span>
			)}
		</header>
	)
}

export const DocHeader = memo(DocHeaderBase)
