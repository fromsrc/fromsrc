import { type ReactNode, memo, type JSX } from "react"

/**
 * Props for a single release entry in the changelog
 */
export interface ReleaseProps {
	version: string
	date?: string
	datetime?: string
	children: ReactNode
}

export const Release = memo(function Release({
	version,
	date,
	datetime,
	children,
}: ReleaseProps): JSX.Element {
	return (
		<article className="relative pl-6 pb-8 border-l border-line last:pb-0">
			<div
				className="absolute left-0 top-0 w-3 h-3 -translate-x-1/2 rounded-full bg-accent border-2 border-bg"
				aria-hidden="true"
			/>
			<header className="flex items-baseline gap-3 mb-4">
				<h3 className="text-lg font-medium text-fg">{version}</h3>
				{date && (
					<time dateTime={datetime ?? date} className="text-sm text-muted">
						{date}
					</time>
				)}
			</header>
			<ul className="space-y-2 list-none p-0 m-0">{children}</ul>
		</article>
	)
})

/**
 * Type of change in a changelog entry
 */
export type ChangeType = "added" | "changed" | "fixed" | "removed" | "deprecated" | "security"

/**
 * Style configuration for each change type
 */
interface TypeStyle {
	bg: string
	text: string
	label: string
}

const typeStyles: Record<ChangeType, TypeStyle> = {
	added: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "added" },
	changed: { bg: "bg-blue-500/10", text: "text-blue-400", label: "changed" },
	fixed: { bg: "bg-amber-500/10", text: "text-amber-400", label: "fixed" },
	removed: { bg: "bg-red-500/10", text: "text-red-400", label: "removed" },
	deprecated: { bg: "bg-orange-500/10", text: "text-orange-400", label: "deprecated" },
	security: { bg: "bg-purple-500/10", text: "text-purple-400", label: "security" },
}

/**
 * Props for a single change item within a release
 */
export interface ChangeProps {
	type: ChangeType
	children: ReactNode
}

export const Change = memo(function Change({ type, children }: ChangeProps): JSX.Element {
	const style = typeStyles[type]
	return (
		<li className="flex items-start gap-2 text-sm">
			<span
				className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium ${style.bg} ${style.text}`}
			>
				{style.label}
			</span>
			<span className="text-muted">{children}</span>
		</li>
	)
})

/**
 * Props for the changelog container component
 */
export interface ChangelogProps {
	children: ReactNode
}

export const Changelog = memo(function Changelog({ children }: ChangelogProps): JSX.Element {
	return <section className="my-8">{children}</section>
})
