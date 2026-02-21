"use client"

import type { JSX } from "react"
import { IconSearch } from "./icons"

export interface TriggerProps {
	onOpen: () => void
}

export function Trigger({ onOpen }: TriggerProps): JSX.Element {
	return (
		<button type="button" onClick={onOpen} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted bg-surface border border-line rounded-lg hover:border-dim transition-colors">
			<IconSearch className="w-3.5 h-3.5" size={14} />
			<span className="flex-1 text-left">search</span>
			<kbd className="px-1.5 py-0.5 text-[10px] bg-bg border border-line rounded">⌘K</kbd>
		</button>
	)
}
