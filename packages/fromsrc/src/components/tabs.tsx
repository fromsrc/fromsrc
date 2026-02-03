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
}

const TabsContext = createContext<TabsContextValue | null>(null)

/**
 * Accessible tabbed interface component with keyboard navigation.
 * Supports arrow keys, Home, and End for navigation.
 * @property items - array of tab names to display
 * @property defaultValue - initially active tab, defaults to first item
 * @property children - Tab elements corresponding to items
 * @example
 * ```tsx
 * <Tabs items={["npm", "yarn", "pnpm"]}>
 *   <Tab value="npm">npm install fromsrc</Tab>
 *   <Tab value="yarn">yarn add fromsrc</Tab>
 *   <Tab value="pnpm">pnpm add fromsrc</Tab>
 * </Tabs>
 * ```
 */
export interface TabsProps {
	items: readonly string[]
	defaultValue?: string
	children: ReactNode
}

export function Tabs({ items, defaultValue, children }: TabsProps): JSX.Element {
	const [active, setActive] = useState<string>(defaultValue ?? items[0] ?? "")
	const id = useId()
	const tabsRef = useRef<HTMLDivElement>(null)

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
		<TabsContext.Provider value={{ active, setActive, id }}>
			<div className="my-6">
				<div
					ref={tabsRef}
					role="tablist"
					onKeyDown={handleKeyDown}
					className="flex border-b border-line"
				>
					{items.map((item, index) => (
						<button
							key={item}
							id={`${id}-tab-${index}`}
							type="button"
							role="tab"
							aria-selected={active === item}
							aria-controls={`${id}-panel-${index}`}
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
					id={`${id}-panel-${items.indexOf(active)}`}
					role="tabpanel"
					aria-labelledby={`${id}-tab-${items.indexOf(active)}`}
					tabIndex={0}
					className="pt-4"
				>
					{children}
				</div>
			</div>
		</TabsContext.Provider>
	)
}

/**
 * Individual tab panel content within a Tabs container.
 * Only renders when its value matches the active tab.
 * @property value - must match an item from parent Tabs items array
 * @property children - content to display when tab is active
 */
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
