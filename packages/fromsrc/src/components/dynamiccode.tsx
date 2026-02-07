"use client"

import { type ReactNode, memo, useEffect, useRef, useState } from "react"
import { CodeBlock } from "./codeblock"

export interface DynamicCodeProps {
	code: string
	lang?: string
	title?: string
	lines?: boolean
	theme?: string
}

async function highlight(code: string, lang: string, theme: string): Promise<string> {
	const { codeToHtml } = await import("shiki")
	return codeToHtml(code, {
		lang,
		theme,
		structure: "inline",
	})
}

export const DynamicCode = memo(function DynamicCode({
	code,
	lang = "text",
	title,
	lines,
	theme = "github-dark-default",
}: DynamicCodeProps): ReactNode {
	const [html, setHtml] = useState<string | null>(null)
	const prevCode = useRef(code)
	const prevLang = useRef(lang)

	useEffect(() => {
		let cancelled = false

		if (code !== prevCode.current || lang !== prevLang.current || !html) {
			prevCode.current = code
			prevLang.current = lang

			highlight(code, lang, theme).then((result) => {
				if (!cancelled) setHtml(result)
			})
		}

		return () => {
			cancelled = true
		}
	}, [code, lang, theme, html])

	return (
		<CodeBlock lang={lang} title={title} lines={lines}>
			{html ? (
				<code dangerouslySetInnerHTML={{ __html: html }} />
			) : (
				<code>{code}</code>
			)}
		</CodeBlock>
	)
})
