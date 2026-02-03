"use client"

import type { JSX, ReactNode } from "react"
import { memo, useEffect, useState } from "react"

function extractText(children: ReactNode): string {
	if (typeof children === "string") return children
	if (typeof children === "number") return String(children)
	if (Array.isArray(children)) return children.map(extractText).join("")
	if (children && typeof children === "object" && "props" in children) {
		return extractText((children as { props: { children?: ReactNode } }).props.children)
	}
	return ""
}

interface KatexAPI {
	renderToString: (tex: string, options: { displayMode: boolean; throwOnError: boolean }) => string
}

/**
 * Props for the Math component
 */
export interface MathProps {
	/** LaTeX content to render */
	children: ReactNode
	/** Whether to render as block display mode */
	display?: boolean
}

function MathBase({ children, display = false }: MathProps): JSX.Element {
	const text = extractText(children)
	const [html, setHtml] = useState<string>("")

	useEffect(() => {
		let mounted = true

		async function render(): Promise<void> {
			try {
				const module = await import("katex" as string)
				const katex = module.default as KatexAPI
				const rendered = katex.renderToString(text, {
					displayMode: display,
					throwOnError: false,
				})
				if (mounted) setHtml(rendered)
			} catch {
				if (mounted) setHtml(text)
			}
		}

		render()
		return (): void => {
			mounted = false
		}
	}, [text, display])

	if (!html) {
		return display ? (
			<div className="my-4 animate-pulse h-8 bg-surface/30 rounded" aria-hidden="true" />
		) : (
			<span aria-hidden="true" />
		)
	}

	if (display) {
		return (
			<div
				className="my-4 overflow-x-auto"
				role="math"
				aria-label={text}
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		)
	}

	return <span role="math" aria-label={text} dangerouslySetInnerHTML={{ __html: html }} />
}

export const Math = memo(MathBase)

/**
 * Props for the BlockMath component
 */
export interface BlockMathProps {
	/** LaTeX content to render as a block */
	children: ReactNode
}

function BlockMathBase({ children }: BlockMathProps): JSX.Element {
	return <Math display>{children}</Math>
}

export const BlockMath = memo(BlockMathBase)

/**
 * Props for the InlineMath component
 */
export interface InlineMathProps {
	/** LaTeX content to render inline */
	children: ReactNode
}

function InlineMathBase({ children }: InlineMathProps): JSX.Element {
	return <Math>{children}</Math>
}

export const InlineMath = memo(InlineMathBase)
