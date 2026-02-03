import { type ReactNode, type JSX, memo } from "react"

/**
 * Props for note-style callout components
 */
export interface NoteProps {
	/** Content to display inside the note */
	children: ReactNode
	/** Additional CSS classes */
	className?: string
	/** Accessible label for screen readers */
	label?: string
}

/**
 * Subtle informational callout with left border
 */
export const Note = memo(function Note({
	children,
	className = "",
	label = "Note",
}: NoteProps): JSX.Element {
	return (
		<aside
			role="note"
			aria-label={label}
			className={`my-4 pl-4 border-l-2 border-muted/30 text-sm text-muted italic ${className}`}
		>
			{children}
		</aside>
	)
})

/**
 * Warning callout for important information
 */
export const Important = memo(function Important({
	children,
	className = "",
	label = "Important",
}: NoteProps): JSX.Element {
	return (
		<aside
			role="note"
			aria-label={label}
			className={`my-4 pl-4 border-l-2 border-amber-500/50 text-sm text-amber-200/80 ${className}`}
		>
			{children}
		</aside>
	)
})

/**
 * Callout for experimental or unstable features
 */
export const Experimental = memo(function Experimental({
	children,
	className = "",
	label = "Experimental",
}: NoteProps): JSX.Element {
	return (
		<aside
			role="note"
			aria-label={label}
			className={`my-4 px-4 py-3 rounded-lg bg-purple-500/5 border border-purple-500/20 text-sm text-purple-200/80 ${className}`}
		>
			<span
				aria-hidden="true"
				className="text-[10px] uppercase tracking-wider text-purple-400 font-medium"
			>
				experimental
			</span>
			<div className="mt-1">{children}</div>
		</aside>
	)
})
