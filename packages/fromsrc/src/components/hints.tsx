"use client"

import type { JSX } from "react"

export function Hints(): JSX.Element {
	return (
		<div className="flex items-center justify-center gap-4 px-4 py-2 border-t border-line text-[10px] text-dim">
			<span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-bg border border-line rounded">↑</kbd><kbd className="px-1 py-0.5 bg-bg border border-line rounded">↓</kbd>navigate</span>
			<span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-bg border border-line rounded">tab</kbd><kbd className="px-1 py-0.5 bg-bg border border-line rounded">↵</kbd>complete/select</span>
			<span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-bg border border-line rounded">home</kbd><kbd className="px-1 py-0.5 bg-bg border border-line rounded">end</kbd>first/last</span>
		</div>
	)
}
