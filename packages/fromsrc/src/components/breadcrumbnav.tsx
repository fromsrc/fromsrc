"use client"

import Link from "next/link"
import { memo, type JSX, type ReactNode } from "react"

export interface BreadcrumbNavProps {
	path: string
	labels?: Record<string, string>
	separator?: ReactNode
	className?: string
	homeLabel?: string
	homeHref?: string
}

interface Crumb {
	href: string
	label: string
}

function format(slug: string): string {
	return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function build(path: string, labels?: Record<string, string>): Crumb[] {
	const segments = path.split("/").filter(Boolean)
	return segments.map((seg, i) => ({
		href: `/${segments.slice(0, i + 1).join("/")}`,
		label: labels?.[seg] ?? format(seg),
	}))
}

function jsonld(crumbs: Crumb[], homeLabel: string, homeHref: string): string {
	return JSON.stringify({
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: homeLabel, item: homeHref },
			...crumbs.map((c, i) => ({
				"@type": "ListItem",
				position: i + 2,
				name: c.label,
				item: `${homeHref.replace(/\/$/, "")}${c.href}`,
			})),
		],
	})
		.replace(/</g, "\\u003c")
		.replace(/\u2028/g, "\\u2028")
		.replace(/\u2029/g, "\\u2029")
}

function BreadcrumbNavBase({
	path,
	labels,
	separator,
	className,
	homeLabel = "Home",
	homeHref = "/",
}: BreadcrumbNavProps): JSX.Element {
	const crumbs = build(path, labels)
	const sep = separator ?? "/"

	return (
		<nav aria-label="breadcrumb" className={className ?? "flex items-center gap-1 text-sm text-muted"}>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: jsonld(crumbs, homeLabel, homeHref) }}
			/>
			<ol className="flex items-center gap-1">
				<li>
					<Link href={homeHref} className="hover:text-fg transition-colors">
						{homeLabel}
					</Link>
				</li>
				{crumbs.map((crumb, i) => (
					<li key={crumb.href} className="flex items-center gap-1">
						<span aria-hidden="true" className="text-dim">{sep}</span>
						{i === crumbs.length - 1 ? (
							<span aria-current="page" className="text-fg font-medium">{crumb.label}</span>
						) : (
							<Link href={crumb.href} className="hover:text-fg transition-colors">
								{crumb.label}
							</Link>
						)}
					</li>
				))}
			</ol>
		</nav>
	)
}

export const BreadcrumbNav = memo(BreadcrumbNavBase)
