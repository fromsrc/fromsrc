"use client"

import {
	createContext,
	type Dispatch,
	type JSX,
	type KeyboardEvent,
	type ReactNode,
	type SetStateAction,
	useCallback,
	useContext,
	useId,
	useRef,
	useState,
} from "react"
import { getNextIndex } from "../hooks/arrownav"

interface TabsContextValue {
	active: string
	setActive: Dispatch<SetStateAction<string>>
	id: string
	getTabId: (value: string) => string
	getPanelId: (value: string) => string
}

const TabsContext = createContext<TabsContextValue | null>(null)

export interface TabsProps {
	items: readonly string[]
	defaultValue?: string
	children: ReactNode
}

export function Tabs({ items, defaultValue, children }: TabsProps): JSX.Element {
	const [active, setActive] = useState<string>(defaultValue ?? items[0] ?? "")
	const id = useId()
	const tabsRef = useRef<HTMLDivElement>(null)
	const tabMap = useRef<Map<string, number>>(new Map())
	for (const item of items) {
		if (!tabMap.current.has(item)) {
			tabMap.current.set(item, tabMap.current.size)
		}
	}
	const getTabId = useCallback(
		(value: string): string => {
			const index = tabMap.current.get(value) ?? 0
			return `${id}-tab-${index}`
		},
		[id],
	)
	const getPanelId = useCallback(
		(value: string): string => {
			const index = tabMap.current.get(value) ?? 0
			return `${id}-panel-${index}`
		},
		[id],
	)

	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLDivElement>): void => {
			const currentIndex = items.indexOf(active)
			const nextIndex = getNextIndex(e.key, {
				count: items.length,
				current: currentIndex,
				direction: "horizontal",
				wrap: true,
			})
			if (nextIndex === currentIndex) return
			e.preventDefault()
			const nextItem = items[nextIndex]
			if (nextItem !== undefined) {
				setActive(nextItem)
			}
			const tabs = tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
			tabs?.[nextIndex]?.focus()
		},
		[active, items],
	)

	return (
		<TabsContext.Provider value={{ active, setActive, id, getTabId, getPanelId }}>
			<div className="my-6">
				<div
					ref={tabsRef}
					role="tablist"
					onKeyDown={handleKeyDown}
					className="flex border-b border-line"
				>
					{items.map((item) => (
						<button
							key={item}
							id={getTabId(item)}
							type="button"
							role="tab"
							aria-selected={active === item}
							aria-controls={getPanelId(item)}
							tabIndex={active === item ? 0 : -1}
							onClick={() => setActive(item)}
							className={`px-4 py-2 text-sm font-medium transition-colors border-b -mb-px ${
								active === item
									? "text-fg border-fg"
									: "text-muted hover:text-fg border-transparent"
							}`}
						>
							{item}
						</button>
					))}
				</div>
				<div
					id={getPanelId(active)}
					role="tabpanel"
					aria-labelledby={getTabId(active)}
					tabIndex={0}
					className="pt-4"
				>
					{children}
				</div>
			</div>
		</TabsContext.Provider>
	)
}

export interface TabProps {
	value: string
	children: ReactNode
}

export function Tab({ value, children }: TabProps): JSX.Element | null {
	const context = useContext(TabsContext)
	if (!context) return null
	if (context.active !== value) return null
	return <>{children}</>
}
