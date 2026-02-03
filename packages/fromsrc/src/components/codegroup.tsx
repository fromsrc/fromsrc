"use client"

import { createContext, memo, type ReactNode, useCallback, useContext, useState } from "react"

interface CodeGroupContext {
	active: string
	set: (v: string) => void
}

const Context = createContext<CodeGroupContext | null>(null)

/**
 * container for tabbed code blocks
 * @property children - CodeTab elements
 * @property defaultValue - initially active tab value
 */
export interface CodeGroupProps {
	children: ReactNode
	defaultValue?: string
}

/**
 * individual tab within a code group
 * @property value - unique tab identifier
 * @property label - displayed tab name
 * @property children - tab content
 */
export interface CodeTabProps {
	value: string
	label: string
	children: ReactNode
}

/**
 * wrapper for tab buttons in a code group
 * @property children - CodeTab button elements
 */
export interface CodeTabsProps {
	children: ReactNode
}

export function CodeGroup({ children, defaultValue }: CodeGroupProps): ReactNode {
	const [active, set] = useState(defaultValue || "")

	return (
		<Context.Provider value={{ active, set }}>
			<div className="my-4 rounded-lg border border-white/10 overflow-hidden">{children}</div>
		</Context.Provider>
	)
}

export function CodeTab({ value, label, children }: CodeTabProps): ReactNode {
	const ctx = useContext(Context)

	const handleClick = useCallback((): void => {
		ctx?.set(value)
	}, [ctx, value])

	if (!ctx) return null

	const isActive = ctx.active === value || (!ctx.active && value === label)
	const tabId = `tab-${value}`
	const panelId = `panel-${value}`

	return (
		<>
			<button
				type="button"
				role="tab"
				id={tabId}
				aria-selected={isActive}
				aria-controls={panelId}
				tabIndex={isActive ? 0 : -1}
				onClick={handleClick}
				className={`px-4 py-2 text-sm font-medium border-b ${
					isActive ? "border-fg/30 text-fg bg-fg/5" : "border-transparent text-fg/60 hover:text-fg"
				}`}
			>
				{label}
			</button>
			{isActive && (
				<div
					role="tabpanel"
					id={panelId}
					aria-labelledby={tabId}
					className="[&>pre]:!mt-0 [&>pre]:!rounded-t-none"
				>
					{children}
				</div>
			)}
		</>
	)
}

export const CodeTabs = memo(function CodeTabs({ children }: CodeTabsProps): ReactNode {
	return (
		<div role="tablist" aria-label="code examples" className="flex border-b border-white/10 bg-bg">
			{children}
		</div>
	)
})
