"use client"

import katex from "katex"
import type { ReactNode } from "react"
import { useMemo } from "react"

function extractText(children: ReactNode): string {
	if (typeof children === "string") return children
	if (typeof children === "number") return String(children)
	if (Array.isArray(children)) return children.map(extractText).join("")
	if (children && typeof children === "object" && "props" in children) {
		return extractText((children as { props: { children?: ReactNode } }).props.children)
	}
	return ""
}

interface MathProps {
	children: ReactNode
	display?: boolean
}

export function Math({ children, display = false }: MathProps) {
	const text = extractText(children)
	const html = useMemo(() => {
		try {
			return katex.renderToString(text, {
				displayMode: display,
				throwOnError: false,
			})
		} catch {
			return text
		}
	}, [text, display])

	if (display) {
		return (
			<div
				className="my-4 overflow-x-auto"
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		)
	}

	return <span dangerouslySetInnerHTML={{ __html: html }} />
}

interface BlockMathProps {
	children: ReactNode
}

export function BlockMath({ children }: BlockMathProps) {
	return <Math display>{children}</Math>
}

interface InlineMathProps {
	children: ReactNode
}

export function InlineMath({ children }: InlineMathProps) {
	return <Math>{children}</Math>
}
