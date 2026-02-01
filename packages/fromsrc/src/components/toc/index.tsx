"use client"

import { useToc } from "./hook"
import { TocDefault } from "./default"
import { TocMinimal } from "./minimal"

export type TocVariant = "default" | "minimal"

export interface TocProps {
	variant?: TocVariant
	zigzag?: boolean
	multi?: boolean
}

export function Toc({ variant = "default", zigzag = false, multi = false }: TocProps) {
	const { headings, active, activeRange } = useToc(variant !== "minimal" && multi)

	if (headings.length === 0) return null

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
				<p className="text-xs text-muted mb-4">on this page</p>
				{renderToc()}
			</div>
		</aside>
	)
}

export { useToc } from "./hook"
export type { Heading, TocState } from "./hook"
