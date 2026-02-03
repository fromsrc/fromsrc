"use client"

import katex from "katex"
import { useMemo } from "react"

interface MathProps {
	children: string
	display?: boolean
}

export function Math({ children, display = false }: MathProps) {
	const html = useMemo(() => {
		try {
			return katex.renderToString(children, {
				displayMode: display,
				throwOnError: false,
			})
		} catch {
			return children
		}
	}, [children, display])

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
	children: string
}

export function BlockMath({ children }: BlockMathProps) {
	return <Math display>{children}</Math>
}

interface InlineMathProps {
	children: string
}

export function InlineMath({ children }: InlineMathProps) {
	return <Math>{children}</Math>
}
