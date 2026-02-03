"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface CopyableProps {
	value: string
	label?: string
}

export function Copyable({ value, label }: CopyableProps) {
	const [copied, setCopied] = useState(false)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value)
			setCopied(true)
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
			timeoutRef.current = setTimeout(() => setCopied(false), 2000)
		} catch {
			setCopied(false)
		}
	}

	return (
		<div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-line font-mono text-sm">
			{label && <span className="text-muted">{label}</span>}
			<span className="text-fg">{value}</span>
			<button
				type="button"
				onClick={copy}
				className="text-muted hover:text-fg transition-colors"
				aria-label={copied ? "copied" : "copy to clipboard"}
			>
				{copied ? (
					<Check size={14} className="text-emerald-400" aria-hidden="true" />
				) : (
					<Copy size={14} aria-hidden="true" />
				)}
			</button>
		</div>
	)
}

interface CopyBlockProps {
	children: string
}

export function CopyBlock({ children }: CopyBlockProps) {
	const [copied, setCopied] = useState(false)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(children)
			setCopied(true)
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
			timeoutRef.current = setTimeout(() => setCopied(false), 2000)
		} catch {
			setCopied(false)
		}
	}

	return (
		<div className="my-4 flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-surface border border-line font-mono text-sm">
			<span className="text-fg truncate">{children}</span>
			<button
				type="button"
				onClick={copy}
				className="shrink-0 text-muted hover:text-fg transition-colors"
				aria-label={copied ? "copied" : "copy to clipboard"}
			>
				{copied ? (
					<Check size={16} className="text-emerald-400" aria-hidden="true" />
				) : (
					<Copy size={16} aria-hidden="true" />
				)}
			</button>
		</div>
	)
}
