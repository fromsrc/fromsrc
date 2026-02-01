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
	const { headings, active, activeRange, progress } = useToc(variant !== "minimal" && multi)

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

	const renderToc = () => {
		switch (variant) {
			case "minimal":
				return <TocMinimal headings={headings} active={active} zigzag={zigzag} />
			default:
				return (
					<TocDefault
						headings={headings}
						active={active}
						activeRange={activeRange}
						zigzag={zigzag}
					/>
				)
		}
	}

	return (
		<aside className="w-52 shrink-0 hidden xl:block py-12">
			<div className="sticky top-12 pr-4">
				<div className="flex items-center gap-3 mb-4">
					<p className="text-xs text-muted">on this page</p>
					<div className="flex-1 h-0.5 bg-line rounded-full overflow-hidden">
						<div
							className="h-full bg-accent transition-[width] duration-150"
							style={{ width: `${progress * 100}%` }}
						/>
					</div>
				</div>
				{renderToc()}
			</div>
		</aside>
	)
}

export { useToc } from "./hook"
export type { Heading, TocState } from "./hook"
