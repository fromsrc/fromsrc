"use client"

import { lazy, Suspense } from "react"
import { useToc } from "./hook"

const TocDefault = lazy(() => import("./default").then((m) => ({ default: m.TocDefault })))
const TocMinimal = lazy(() => import("./minimal").then((m) => ({ default: m.TocMinimal })))
const TocInline = lazy(() => import("./inline").then((m) => ({ default: m.TocInline })))

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
			<Suspense fallback={null}>
				<TocInline
					headings={headings}
					title={title}
					collapsible={collapsible}
					defaultOpen={defaultOpen}
				/>
			</Suspense>
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
		<aside className="w-56 shrink-0 hidden xl:block py-12 pl-8">
			<div className="sticky top-12">
				<p className="text-xs text-muted mb-4">on this page</p>
				<Suspense fallback={null}>{renderToc()}</Suspense>
			</div>
		</aside>
	)
}

export type { Heading, TocState } from "./hook"
export { useToc } from "./hook"
