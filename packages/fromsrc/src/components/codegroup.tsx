"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface CodeGroupContext {
	active: string
	set: (v: string) => void
}

const Context = createContext<CodeGroupContext | null>(null)

export interface CodeGroupProps {
	children: ReactNode
	defaultValue?: string
}

export interface CodeTabProps {
	value: string
	label: string
	children: ReactNode
}

export function CodeGroup({ children, defaultValue }: CodeGroupProps) {
	const [active, set] = useState(defaultValue || "")

	return (
		<Context.Provider value={{ active, set }}>
			<div className="my-4 rounded-lg border border-white/10 overflow-hidden">{children}</div>
		</Context.Provider>
	)
}

export function CodeTab({ value, label, children }: CodeTabProps) {
	const ctx = useContext(Context)
	if (!ctx) return null

	const isActive = ctx.active === value || (!ctx.active && value === label)

	return (
		<>
			<button
				type="button"
				onClick={() => ctx.set(value)}
				className={`px-4 py-2 text-sm font-medium border-b ${
					isActive ? "border-fg/30 text-fg bg-fg/5" : "border-transparent text-fg/60 hover:text-fg"
				}`}
			>
				{label}
			</button>
			{isActive && <div className="[&>pre]:!mt-0 [&>pre]:!rounded-t-none">{children}</div>}
		</>
	)
}

export function CodeTabs({ children }: { children: ReactNode }) {
	return <div className="flex border-b border-white/10 bg-bg">{children}</div>
}
