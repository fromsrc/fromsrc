"use client"

import { type JSX, memo, useCallback } from "react"
import { useCopy } from "../hooks/copy"
import { IconCheck, IconCopy } from "./icons"

/**
 * Props for the Copyable component
 */
export interface CopyableProps {
	/** The value to copy to clipboard */
	value: string
	/** Optional label displayed before the value */
	label?: string
}

function CopyableBase({ value, label }: CopyableProps): JSX.Element {
	const { copied, copy } = useCopy()

	const handleCopy = useCallback((): void => {
		copy(value)
	}, [copy, value])

	return (
		<div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-line font-mono text-sm">
			{label && <span className="text-muted">{label}</span>}
			<span className="text-fg">{value}</span>
			<button
				type="button"
				onClick={handleCopy}
				className="text-muted hover:text-fg transition-colors"
				aria-label="copy to clipboard"
			>
				{copied ? <IconCheck size={14} className="text-emerald-400" /> : <IconCopy size={14} />}
			</button>
			<span role="status" aria-live="polite" className="sr-only">
				{copied ? "copied" : ""}
			</span>
		</div>
	)
}

export const Copyable = memo(CopyableBase)

/**
 * Props for the CopyBlock component
 */
export interface CopyBlockProps {
	/** The text content to display and copy */
	children: string
}

function CopyBlockBase({ children }: CopyBlockProps): JSX.Element {
	const { copied, copy } = useCopy()

	const handleCopy = useCallback((): void => {
		copy(children)
	}, [copy, children])

	return (
		<div className="my-4 flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-surface border border-line font-mono text-sm">
			<span className="text-fg truncate">{children}</span>
			<button
				type="button"
				onClick={handleCopy}
				className="shrink-0 text-muted hover:text-fg transition-colors"
				aria-label="copy to clipboard"
			>
				{copied ? <IconCheck size={16} className="text-emerald-400" /> : <IconCopy size={16} />}
			</button>
			<span role="status" aria-live="polite" className="sr-only">
				{copied ? "copied" : ""}
			</span>
		</div>
	)
}

export const CopyBlock = memo(CopyBlockBase)
