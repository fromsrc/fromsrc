"use client"

import { useCopy } from "../hooks/copy"
import { IconCheck, IconCopy } from "./icons"

interface CopyableProps {
	value: string
	label?: string
}

export function Copyable({ value, label }: CopyableProps) {
	const { copied, copy } = useCopy()

	return (
		<div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-line font-mono text-sm">
			{label && <span className="text-muted">{label}</span>}
			<span className="text-fg">{value}</span>
			<button
				type="button"
				onClick={() => copy(value)}
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
	const { copied, copy } = useCopy()

	return (
		<div className="my-4 flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-surface border border-line font-mono text-sm">
			<span className="text-fg truncate">{children}</span>
			<button
				type="button"
				onClick={() => copy(children)}
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
