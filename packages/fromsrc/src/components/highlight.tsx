import type { ReactNode } from "react"

export type HighlightColor = "yellow" | "green" | "blue" | "red" | "purple"

export interface HighlightProps {
	children: ReactNode
	color?: HighlightColor
}

const colors: Record<HighlightColor, string> = {
	yellow: "bg-yellow-500/20 text-yellow-200",
	green: "bg-green-500/20 text-green-200",
	blue: "bg-blue-500/20 text-blue-200",
	red: "bg-red-500/20 text-red-200",
	purple: "bg-purple-500/20 text-purple-200",
}

export function Highlight({ children, color = "yellow" }: HighlightProps) {
	return <mark className={`rounded px-1 transition-colors ${colors[color]}`}>{children}</mark>
}

export type UnderlineStyle = "solid" | "wavy" | "dotted" | "dashed"

export interface UnderlineProps {
	children: ReactNode
	style?: UnderlineStyle
}

const underlineStyles: Record<UnderlineStyle, string> = {
	solid: "decoration-solid",
	wavy: "decoration-wavy",
	dotted: "decoration-dotted",
	dashed: "decoration-dashed",
}

export function Underline({ children, style = "solid" }: UnderlineProps) {
	return (
		<span
			className={`underline decoration-accent underline-offset-4 transition-colors ${underlineStyles[style]}`}
		>
			{children}
		</span>
	)
}
