"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { memo, type JSX } from "react"

/**
 * Represents a single breadcrumb navigation item.
 */
export interface BreadcrumbItem {
	href: string
	label: string
}

/**
 * Props for the Breadcrumb component.
 */
export interface BreadcrumbProps {
	base?: string
	rootLabel?: string
	indexLabel?: string
}

function BreadcrumbBase({
	base = "/docs",
	rootLabel = "docs",
	indexLabel = "introduction",
}: BreadcrumbProps): JSX.Element {
	const pathname = usePathname()
	const segments = pathname.replace(base, "").split("/").filter(Boolean)

	const items: BreadcrumbItem[] = segments.map((segment, i) => ({
		href: `${base}/${segments.slice(0, i + 1).join("/")}`,
		label: segment.replace(/-/g, " "),
	}))

	return (
		<nav aria-label="Breadcrumb" className="text-xs text-muted">
			<ol className="flex items-center gap-2">
				<li>
					<Link href={base} className="hover:text-fg transition-colors">
						{rootLabel}
					</Link>
				</li>
				{items.length === 0 ? (
					<li className="flex items-center gap-2">
						<span aria-hidden="true" className="text-dim">
							/
						</span>
						<span aria-current="page" className="text-fg">
							{indexLabel}
						</span>
					</li>
				) : (
					items.map((item, i) => (
						<li key={item.href} className="flex items-center gap-2">
							<span aria-hidden="true" className="text-dim">
								/
							</span>
							{i === items.length - 1 ? (
								<span aria-current="page" className="text-fg">
									{item.label}
								</span>
							) : (
								<Link href={item.href} className="hover:text-fg transition-colors">
									{item.label}
								</Link>
							)}
						</li>
					))
				)}
			</ol>
		</nav>
	)
}

/**
 * Renders a breadcrumb navigation based on the current pathname.
 */
export const Breadcrumb = memo(BreadcrumbBase)
