"use client"

import {
	createContext,
	memo,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react"

const KEY = "fromsrc-code-lang"

interface CodeGroupContext {
	active: string
	set: (v: string) => void
	tabs: Set<string>
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

export interface CodeTabsProps {
	children: ReactNode
}

export function CodeGroup({ children, defaultValue }: CodeGroupProps): ReactNode {
	const [active, rawSet] = useState(defaultValue || "")
	const tabs = useRef(new Set<string>()).current

	useEffect(() => {
		try {
			const stored = localStorage.getItem(KEY)
			if (stored && tabs.has(stored)) rawSet(stored)
		} catch {}
	}, [tabs])

	useEffect(() => {
		function handler(e: Event): void {
			const v = (e as CustomEvent).detail as string
			if (tabs.has(v)) rawSet(v)
		}
		window.addEventListener(KEY, handler)
		return () => window.removeEventListener(KEY, handler)
	}, [tabs])

	const set = useCallback((v: string): void => {
		rawSet(v)
		try {
			localStorage.setItem(KEY, v)
		} catch {}
		window.dispatchEvent(new CustomEvent(KEY, { detail: v }))
	}, [])

	return (
		<Context.Provider value={{ active, set, tabs }}>
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

	ctx.tabs.add(value)

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
