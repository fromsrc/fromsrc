"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { IconCheck, IconCopy } from "./icons"

function usecopy(text: string) {
	const [copied, setCopied] = useState(false)
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

	const copy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(text)
			setCopied(true)
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
			timeoutRef.current = setTimeout(() => setCopied(false), 2000)
		} catch {
			setCopied(false)
		}
	}, [text])

	return { copied, copy }
}

interface CopyableProps {
	value: string
	label?: string
}

export function Copyable({ value, label }: CopyableProps) {
	const { copied, copy } = usecopy(value)

	return (
		<div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-line font-mono text-sm">
			{label && <span className="text-muted">{label}</span>}
			<span className="text-fg">{value}</span>
			<button
				type="button"
				onClick={copy}
				className="text-muted hover:text-fg transition-colors"
				aria-label="copy to clipboard"
			>
				{copied ? (
					<IconCheck size={14} className="text-emerald-400" />
				) : (
					<IconCopy size={14} />
				)}
			</button>
			<span role="status" aria-live="polite" className="sr-only">
				{copied ? "copied" : ""}
			</span>
		</div>
	)
}

interface CopyBlockProps {
	children: string
}

export function CopyBlock({ children }: CopyBlockProps) {
	const { copied, copy } = usecopy(children)

	return (
		<div className="my-4 flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-surface border border-line font-mono text-sm">
			<span className="text-fg truncate">{children}</span>
			<button
				type="button"
				onClick={copy}
				className="shrink-0 text-muted hover:text-fg transition-colors"
				aria-label="copy to clipboard"
			>
				{copied ? (
					<IconCheck size={16} className="text-emerald-400" />
				) : (
					<IconCopy size={16} />
				)}
			</button>
			<span role="status" aria-live="polite" className="sr-only">
				{copied ? "copied" : ""}
			</span>
		</div>
	)
}
