"use client"

import { type ReactElement, memo, useCallback, useEffect, useRef, useState } from "react"

export interface CodeCopyProps {
	code: string
	className?: string
	timeout?: number
}

const svg = { "aria-hidden": true, width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const

function CodeCopyBase({ code, className, timeout = 2000 }: CodeCopyProps): ReactElement {
	const [copied, setCopied] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const handleCopy = useCallback((): void => {
		navigator.clipboard.writeText(code)
		setCopied(true)
		if (timer.current) clearTimeout(timer.current)
		timer.current = setTimeout(() => setCopied(false), timeout)
	}, [code, timeout])

	useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

	return (
		<button
			type="button"
			onClick={handleCopy}
			aria-label={copied ? "Copied" : "Copy code"}
			className={className}
			style={{
				position: "absolute", top: 8, right: 8, display: "flex",
				alignItems: "center", justifyContent: "center", padding: 6,
				background: "transparent", border: "none", cursor: "pointer",
				opacity: copied ? 1 : 0.5, transition: "opacity 0.15s",
			}}
			onMouseEnter={(e) => { e.currentTarget.style.opacity = "1" }}
			onMouseLeave={(e) => { if (!copied) e.currentTarget.style.opacity = "0.5" }}
		>
			{copied ? (
				<svg {...svg}><path d="M20 6L9 17l-5-5" /></svg>
			) : (
				<svg {...svg}>
					<rect x="9" y="9" width="13" height="13" rx="2" />
					<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
				</svg>
			)}
		</button>
	)
}

export const CodeCopy = memo(CodeCopyBase)
