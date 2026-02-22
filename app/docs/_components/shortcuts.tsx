"use client"

import { useEffect, useRef, useState } from "react"

const items = [
	{ keys: ["\u2318K", "/"], label: "search" },
	{ keys: ["\u2190", "\u2192"], label: "prev / next page" },
	{ keys: ["\u2191", "\u2193"], label: "scroll" },
]

export function Shortcuts() {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		function handler(e: MouseEvent) {
			const target = e.target
			if (!(target instanceof Node)) return
			if (ref.current && !ref.current.contains(target)) setOpen(false)
		}
		document.addEventListener("mousedown", handler)
		return () => document.removeEventListener("mousedown", handler)
	}, [open])

	return (
		<div ref={ref} className="fixed bottom-4 right-4 z-50">
			{open ? (
				<div className="bg-surface border border-line rounded-lg p-3 shadow-lg min-w-48">
					<div className="flex flex-col gap-2">
						{items.map((item) => (
							<div key={item.label} className="flex items-center justify-between gap-4">
								<div className="flex gap-1">
									{item.keys.map((key) => (
										<kbd
											key={key}
											className="px-1.5 py-0.5 text-xs bg-bg border border-line rounded font-mono"
										>
											{key}
										</kbd>
									))}
								</div>
								<span className="text-xs text-muted">{item.label}</span>
							</div>
						))}
					</div>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="size-8 flex items-center justify-center bg-surface border border-line rounded-lg shadow-lg text-muted hover:text-fg transition-colors text-sm font-mono"
					aria-label="open shortcuts"
				>
					?
				</button>
			)}
		</div>
	)
}
