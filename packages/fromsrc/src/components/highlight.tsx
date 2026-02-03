import { type ReactNode, type JSX, memo } from "react"

/**
 * Available highlight colors for the Highlight component
 */
export type HighlightColor = "yellow" | "green" | "blue" | "red" | "purple"

/**
 * Props for the Highlight component
 */
export interface HighlightProps {
	/** Content to highlight */
	children: ReactNode
	/** Highlight color variant */
	color?: HighlightColor
}

const colors: Record<HighlightColor, string> = {
	yellow: "bg-yellow-500/20 text-yellow-200",
	green: "bg-green-500/20 text-green-200",
	blue: "bg-blue-500/20 text-blue-200",
	red: "bg-red-500/20 text-red-200",
	purple: "bg-purple-500/20 text-purple-200",
}

function HighlightBase({ children, color = "yellow" }: HighlightProps): JSX.Element {
	return (
		<mark
			className={`rounded px-1 transition-colors ${colors[color]}`}
			role="mark"
			aria-label={`highlighted text in ${color}`}
		>
			{children}
		</mark>
	)
}

/**
 * Renders highlighted text with customizable color
 */
export const Highlight = memo(HighlightBase)

/**
 * Available underline styles for the Underline component
 */
export type UnderlineStyle = "solid" | "wavy" | "dotted" | "dashed"

/**
 * Props for the Underline component
 */
export interface UnderlineProps {
	/** Content to underline */
	children: ReactNode
	/** Underline style variant */
	style?: UnderlineStyle
}

const underlineStyles: Record<UnderlineStyle, string> = {
	solid: "decoration-solid",
	wavy: "decoration-wavy",
	dotted: "decoration-dotted",
	dashed: "decoration-dashed",
}

function UnderlineBase({ children, style = "solid" }: UnderlineProps): JSX.Element {
	return (
		<span
			className={`underline decoration-accent underline-offset-4 transition-colors ${underlineStyles[style]}`}
			role="text"
			aria-label={`underlined text with ${style} style`}
		>
			{children}
		</span>
	)
}

/**
 * Renders underlined text with customizable style
 */
export const Underline = memo(UnderlineBase)
