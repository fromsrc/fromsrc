"use client"

import { type ReactNode, memo, useCallback, useEffect, useId, useRef, useState } from "react"
import { useCopy } from "../hooks/copy"
import { LangIcon } from "./langicon"

const wrapkey = "fromsrc-code-wrap"
const wrapevent = "fromsrc-code-wrap-event"
const linenumberstyle = `[data-line-numbers] code{counter-reset:line}[data-line-numbers] .line::before{counter-increment:line;content:counter(line);display:inline-block;width:3ch;margin-right:1.5ch;text-align:right;color:#4a4a4a;user-select:none;-webkit-user-select:none;font-variant-numeric:tabular-nums}`

const iconstyle = { width: 14, height: 14 }
const btnstyle = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: "6px",
	background: "transparent",
	border: "none",
	cursor: "pointer",
	transition: "color 0.15s",
	borderRadius: "4px",
} as const

interface copybtnprops {
	coderef: React.RefObject<HTMLDivElement | null>
}

const CopyBtn = memo(function CopyBtn({ coderef }: copybtnprops): ReactNode {
	const { copied, copy } = useCopy()
	return (
		<>
			<button
				type="button"
				onClick={() => copy(coderef.current?.textContent ?? "")}
				aria-label={copied ? "Copied" : "Copy code"}
				className="hover:text-neutral-50"
				style={{ ...btnstyle, color: copied ? "#22c55e" : "#737373" }}
			>
				{copied ? (
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconstyle} aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
				) : (
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconstyle} aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
				)}
			</button>
			<span aria-live="polite" className="sr-only">{copied ? "copied to clipboard" : ""}</span>
		</>
	)
})

interface wrapbtnprops {
	wrap: boolean
	toggle: () => void
}

const WrapBtn = memo(function WrapBtn({ wrap, toggle }: wrapbtnprops): ReactNode {
	return (
		<button
			type="button"
			onClick={toggle}
			aria-label="Toggle word wrap"
			className="hover:text-neutral-50"
			style={{ ...btnstyle, color: wrap ? "#ef4444" : "#737373" }}
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconstyle} aria-hidden="true"><path d="M3 6h18M3 12h15a3 3 0 1 1 0 6H9m0 0 3-3m-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" /></svg>
		</button>
	)
})

export interface CodeBlockProps {
	children: ReactNode
	lang?: string
	title?: string
	lines?: boolean
}

export const CodeBlock = memo(function CodeBlock({ children, lang, title, lines }: CodeBlockProps): ReactNode {
	const coderef = useRef<HTMLDivElement>(null)
	const labelid = useId()
	const hasheader = Boolean(title || lang)
	const [wrap, setwrap] = useState(false)

	useEffect(() => {
		try {
			setwrap(localStorage.getItem(wrapkey) === "1")
		} catch {}
		const handler = (event: Event): void => {
			const value = (event as CustomEvent<string>).detail
			setwrap(value === "1")
		}
		window.addEventListener(wrapevent, handler)
		return () => window.removeEventListener(wrapevent, handler)
	}, [])

	const toggle = useCallback((): void => {
		setwrap((prev) => {
			const next = !prev
			const value = next ? "1" : "0"
			try {
				localStorage.setItem(wrapkey, value)
			} catch {}
			window.dispatchEvent(new CustomEvent(wrapevent, { detail: value }))
			return next
		})
	}, [])

	const controls = (
		<div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
			<WrapBtn wrap={wrap} toggle={toggle} />
			<CopyBtn coderef={coderef} />
		</div>
	)

	return (
		<figure role="group" aria-labelledby={hasheader ? labelid : undefined} data-line-numbers={lines || undefined} style={{ position: "relative", margin: "24px 0", borderRadius: "8px", backgroundColor: "#0d0d0d", border: "1px solid #1c1c1c", overflow: "hidden" }}>
			{lines && <style dangerouslySetInnerHTML={{ __html: linenumberstyle }} />}
			{hasheader && (
				<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: "40px", backgroundColor: "#141414", borderBottom: "1px solid #1c1c1c" }}>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						{lang && <LangIcon lang={lang} />}
						<span id={labelid} style={{ fontSize: "0.8rem", fontFamily: "ui-monospace, monospace", color: "#a0a0a0" }}>{title || lang}</span>
					</div>
					{controls}
				</div>
			)}
			<div ref={coderef} tabIndex={0} role="region" aria-label={hasheader ? `${title || lang} code` : "code"} className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] focus:outline-none focus:ring-1 focus:ring-dim" style={{ padding: "14px 16px", overflow: wrap ? "visible" : "auto", fontSize: "13px", lineHeight: "1.6", maxHeight: "500px", whiteSpace: wrap ? "pre-wrap" : "pre", wordBreak: wrap ? "break-all" : "normal" }}>{children}</div>
			{!hasheader && <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", alignItems: "center", gap: "4px" }}>{controls}</div>}
		</figure>
	)
})
