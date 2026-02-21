"use client"

import {
	createContext,
	memo,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useId,
	useRef,
	useState,
} from "react"

const key = "fromsrc-code-lang"

interface codegroupcontext {
	active: string
	set: (value: string) => void
	add: (value: string) => void
	remove: (value: string) => void
	list: string[]
	prefix: string
}

const context = createContext<codegroupcontext | null>(null)

export interface CodeGroupProps {
	children: ReactNode
	defaultValue?: string
	group?: string
	persist?: boolean
}

export interface CodeTabProps {
	value: string
	label: string
	children: ReactNode
}

export interface CodeTabsProps {
	children: ReactNode
}

function safe(value: string): string {
	return value.replace(/[^a-z0-9_-]/gi, "-").toLowerCase()
}

export function CodeGroup({
	children,
	defaultValue,
	group,
	persist = true,
}: CodeGroupProps): ReactNode {
	const [active, rawset] = useState(defaultValue ?? "")
	const [list, setlist] = useState<string[]>([])
	const groupid = group?.trim() || "global"
	const storekey = `${key}:${groupid}`
	const eventkey = `${storekey}:event`
	const uid = useId().replace(/[:]/g, "")

	const add = useCallback((value: string): void => {
		setlist((items) => (items.includes(value) ? items : [...items, value]))
	}, [])

	const remove = useCallback((value: string): void => {
		setlist((items) => items.filter((item) => item !== value))
	}, [])

	useEffect(() => {
		if (list.length === 0) return
		if (active && list.includes(active)) return
		const first = list[0] ?? ""
		if (!persist) {
			rawset(defaultValue && list.includes(defaultValue) ? defaultValue : first)
			return
		}
		try {
			const stored = localStorage.getItem(storekey)
			if (stored && list.includes(stored)) {
				rawset(stored)
				return
			}
		} catch {}
		rawset(defaultValue && list.includes(defaultValue) ? defaultValue : first)
	}, [active, defaultValue, list, persist, storekey])

	useEffect(() => {
		if (!persist) return
		const handler = (event: Event): void => {
			const value = (event as CustomEvent<string>).detail
			if (typeof value === "string" && list.includes(value)) rawset(value)
		}
		window.addEventListener(eventkey, handler)
		return () => window.removeEventListener(eventkey, handler)
	}, [eventkey, list, persist])

	const set = useCallback(
		(value: string): void => {
			rawset(value)
			if (!persist) return
			try {
				localStorage.setItem(storekey, value)
			} catch {}
			window.dispatchEvent(new CustomEvent(eventkey, { detail: value }))
		},
		[eventkey, persist, storekey],
	)

	return (
		<context.Provider value={{ active, set, add, remove, list, prefix: `code-${uid}` }}>
			<div className="my-4 rounded-lg border border-white/10 overflow-hidden">{children}</div>
		</context.Provider>
	)
}

export function CodeTab({ value, label, children }: CodeTabProps): ReactNode {
	const ctx = useContext(context)
	if (!ctx) return null

	useEffect(() => {
		ctx.add(value)
		return () => ctx.remove(value)
	}, [ctx, value])

	const isactive = ctx.active === value || (!ctx.active && ctx.list[0] === value)
	const tabid = `${ctx.prefix}-tab-${safe(value)}`
	const panelid = `${ctx.prefix}-panel-${safe(value)}`

	return (
		<>
			<button
				type="button"
				role="tab"
				id={tabid}
				data-value={value}
				aria-selected={isactive}
				aria-controls={panelid}
				tabIndex={isactive ? 0 : -1}
				onClick={() => ctx.set(value)}
				className={`px-4 py-2 text-sm font-medium border-b ${isactive ? "border-fg/30 text-fg bg-fg/5" : "border-transparent text-fg/60 hover:text-fg"}`}
			>
				{label}
			</button>
			{isactive && (
				<div role="tabpanel" id={panelid} aria-labelledby={tabid} className="[&>pre]:!mt-0 [&>pre]:!rounded-t-none">
					{children}
				</div>
			)}
		</>
	)
}

export const CodeTabs = memo(function CodeTabs({ children }: CodeTabsProps): ReactNode {
	const ctx = useContext(context)
	const ref = useRef<HTMLDivElement>(null)

	const onkey = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>): void => {
			if (!ctx || ctx.list.length === 0) return
			const current = Math.max(0, ctx.list.indexOf(ctx.active || ctx.list[0] || ""))
			let next = current
			if (event.key === "ArrowRight") next = Math.min(ctx.list.length - 1, current + 1)
			if (event.key === "ArrowLeft") next = Math.max(0, current - 1)
			if (event.key === "Home") next = 0
			if (event.key === "End") next = ctx.list.length - 1
			if (next === current) return
			event.preventDefault()
			const value = ctx.list[next]
			if (!value) return
			ctx.set(value)
			const button = ref.current?.querySelector<HTMLButtonElement>(`button[data-value="${value}"]`)
			button?.focus()
		},
		[ctx],
	)

	return (
		<div ref={ref} role="tablist" aria-label="code examples" onKeyDown={onkey} className="flex border-b border-white/10 bg-bg">
			{children}
		</div>
	)
})
