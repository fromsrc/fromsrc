import type { ReactNode } from "react"

/**
 * @param children - code text
 * @param color - highlight color
 * @example <Code color="green">success</Code>
 */
export interface CodeProps {
	children: ReactNode
	color?: "default" | "green" | "red" | "yellow" | "blue"
}

const colors = {
	default: "bg-surface text-fg",
	green: "bg-green-500/10 text-green-300",
	red: "bg-red-500/10 text-red-300",
	yellow: "bg-yellow-500/10 text-yellow-300",
	blue: "bg-blue-500/10 text-blue-300",
}

export function Code({ children, color = "default" }: CodeProps) {
	return (
		<code className={`rounded px-1.5 py-0.5 font-mono text-sm ${colors[color]}`}>
			{children}
		</code>
	)
}

export interface PreProps {
	children: ReactNode
	className?: string
}

export function Pre({ children, className = "" }: PreProps) {
	return (
		<pre
			className={`overflow-x-auto rounded-lg border border-line bg-surface p-4 text-sm ${className}`}
		>
			{children}
		</pre>
	)
}
