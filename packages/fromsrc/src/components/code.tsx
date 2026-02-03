import { type ReactNode, memo } from "react"
import type { JSX } from "react"

/**
 * Props for inline code highlighting.
 * @property children - code text content
 * @property color - semantic highlight color
 */
export interface CodeProps {
	children: ReactNode
	color?: "default" | "green" | "red" | "yellow" | "blue"
}

/**
 * Props for preformatted code blocks.
 * @property children - code block content
 * @property className - additional css classes
 */
export interface PreProps {
	children: ReactNode
	className?: string
}

const colors: Record<NonNullable<CodeProps["color"]>, string> = {
	default: "bg-surface text-fg",
	green: "bg-green-500/10 text-green-300",
	red: "bg-red-500/10 text-red-300",
	yellow: "bg-yellow-500/10 text-yellow-300",
	blue: "bg-blue-500/10 text-blue-300",
}

function CodeComponent({ children, color = "default" }: CodeProps): JSX.Element {
	return (
		<code
			className={`rounded px-1.5 py-0.5 font-mono text-sm ${colors[color]}`}
			role="code"
		>
			{children}
		</code>
	)
}

function PreComponent({ children, className = "" }: PreProps): JSX.Element {
	return (
		<pre
			className={`overflow-x-auto rounded-lg border border-line bg-surface p-4 text-sm ${className}`}
			role="region"
			aria-label="code block"
			tabIndex={0}
		>
			{children}
		</pre>
	)
}

export const Code = memo(CodeComponent)
export const Pre = memo(PreComponent)
