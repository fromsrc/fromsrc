"use client"

import type { JSX } from "react"
import { memo, useCallback, useMemo, useState } from "react"
import { useHotkeys } from "../hooks/hotkeys"

export interface ShortcutItem {
	keys: string[]
	description: string
	group?: string
}

export interface ShortcutsProps {
	shortcuts: ShortcutItem[]
	trigger?: string
	className?: string
}

function ShortcutsBase({ shortcuts, trigger = "?", className = "" }: ShortcutsProps): JSX.Element | null {
	const [open, setOpen] = useState(false)

	const toggle = useCallback(() => setOpen((v) => !v), [])
	const close = useCallback(() => setOpen(false), [])

	useHotkeys([
		{ key: trigger, handler: toggle },
		{ key: "Escape", handler: close },
	])

	const groups = useMemo(() => {
		const map = new Map<string, ShortcutItem[]>()
		for (const s of shortcuts) {
			const g = s.group ?? "General"
			const list = map.get(g) ?? []
			list.push(s)
			map.set(g, list)
		}
		return map
	}, [shortcuts])

	if (!open) return null

	return (
		<div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className}`}>
			<button
				type="button"
				className="absolute inset-0"
				onClick={close}
				aria-label="close shortcuts"
			/>
			<div
				className="relative w-full max-w-lg rounded-xl border border-line bg-surface p-6 shadow-2xl"
				role="dialog"
				aria-modal="true"
				aria-label="keyboard shortcuts"
			>
				{Array.from(groups).map(([group, items]) => (
					<div key={group} className="mb-4 last:mb-0">
						<p className="text-xs font-semibold uppercase text-dim mb-2">{group}</p>
						{items.map((s) => (
							<div key={s.keys.join("")} className="flex items-center justify-between py-1.5">
								<span className="flex items-center gap-1">
									{s.keys.map((k) => (
										<kbd
											key={k}
											className="inline-flex items-center gap-0.5 rounded border border-line bg-surface px-1.5 py-0.5 text-xs font-mono text-muted"
										>
											{k}
										</kbd>
									))}
								</span>
								<span className="text-sm text-fg">{s.description}</span>
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	)
}

export const Shortcuts = memo(ShortcutsBase)
