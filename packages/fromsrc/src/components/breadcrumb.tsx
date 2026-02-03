"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export interface BreadcrumbProps {
	base?: string
}

export function Breadcrumb({ base = "/docs" }: BreadcrumbProps) {
	const pathname = usePathname()
	const segments = pathname.replace(base, "").split("/").filter(Boolean)

	const items = segments.map((segment, i) => {
		const href = `${base}/${segments.slice(0, i + 1).join("/")}`
		const label = segment.replace(/-/g, " ")
		return { href, label }
	})

	return (
		<nav aria-label="breadcrumb" className="flex items-center gap-2 text-xs text-muted">
			<Link href={base} className="hover:text-fg transition-colors">
				docs
			</Link>
			{items.length === 0 ? (
				<span className="flex items-center gap-2">
					<span className="text-dim">/</span>
					<span className="text-fg">introduction</span>
				</span>
			) : (
				items.map((item, i) => (
					<span key={item.href} className="flex items-center gap-2">
						<span className="text-dim">/</span>
						{i === items.length - 1 ? (
							<span className="text-fg">{item.label}</span>
						) : (
							<Link href={item.href} className="hover:text-fg transition-colors">
								{item.label}
							</Link>
						)}
					</span>
				))
			)}
		</nav>
	)
}
