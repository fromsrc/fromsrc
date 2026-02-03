"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"

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

interface MathProps {
	children: ReactNode
	display?: boolean
}

export function Math({ children, display = false }: MathProps) {
	const text = extractText(children)
	const [html, setHtml] = useState<string>("")

	useEffect(() => {
		let mounted = true

		async function render() {
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
		return () => {
			mounted = false
		}
	}, [text, display])

	if (!html) {
		return display ? <div className="my-4 animate-pulse h-8 bg-surface/30 rounded" /> : <span />
	}

	if (display) {
		return <div className="my-4 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
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
