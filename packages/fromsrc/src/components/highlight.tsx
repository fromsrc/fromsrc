import type { ReactNode } from "react"

export interface HighlightProps {
	children: ReactNode
	color?: "yellow" | "green" | "blue" | "red" | "purple"
}

const colors = {
	yellow: "bg-yellow-500/20 text-yellow-200",
	green: "bg-green-500/20 text-green-200",
	blue: "bg-blue-500/20 text-blue-200",
	red: "bg-red-500/20 text-red-200",
	purple: "bg-purple-500/20 text-purple-200",
}

export function Highlight({ children, color = "yellow" }: HighlightProps) {
	return <mark className={`rounded px-1 ${colors[color]}`}>{children}</mark>
}

export interface UnderlineProps {
	children: ReactNode
	style?: "solid" | "wavy" | "dotted" | "dashed"
}

const underlineStyles = {
	solid: "decoration-solid",
	wavy: "decoration-wavy",
	dotted: "decoration-dotted",
	dashed: "decoration-dashed",
}

export function Underline({ children, style = "solid" }: UnderlineProps) {
	return (
		<span className={`underline decoration-accent underline-offset-4 ${underlineStyles[style]}`}>
			{children}
		</span>
	)
}
