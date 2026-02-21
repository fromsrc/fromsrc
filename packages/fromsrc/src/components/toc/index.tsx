"use client"

import { useToc } from "./hook"
import { TocDefault } from "./default"
import { TocMinimal } from "./minimal"
import { TocInline } from "./inline"

export type TocVariant = "default" | "minimal" | "inline"

export interface TocProps {
	variant?: TocVariant
	zigzag?: boolean
	multi?: boolean
	title?: string
	collapsible?: boolean
	defaultOpen?: boolean
}

export function Toc({
	variant = "default",
	zigzag = false,
	multi = false,
	title,
	collapsible = true,
	defaultOpen = false,
}: TocProps) {
	const { headings, active, activeRange } = useToc(variant !== "minimal" && multi)

	if (headings.length === 0) return null

	if (variant === "inline") {
		return (
			<TocInline
				headings={headings}
				title={title}
				collapsible={collapsible}
				defaultOpen={defaultOpen}
			/>
		)
	}

	return (
		<aside className="w-56 shrink-0 hidden lg:block py-12 pl-8">
			<div className="sticky top-12">
				<p className="text-xs text-muted mb-4">on this page</p>
				{variant === "minimal" ? (
					<TocMinimal headings={headings} active={active} zigzag={zigzag} />
				) : (
					<TocDefault
						headings={headings}
						active={active}
						activeRange={activeRange}
						zigzag={zigzag}
					/>
				)}
			</div>
		</aside>
	)
}

export type { Heading, TocState } from "./hook"
export { useToc } from "./hook"
