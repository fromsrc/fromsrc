"use client"

import {
	createContext,
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useContext,
	useId,
	useRef,
	useState,
} from "react"

interface TabsContextValue {
	active: string
	setActive: (value: string) => void
	id: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

/**
 * @param items - array of tab names
 * @param defaultValue - initially active tab
 * @param children - Tab elements
 * @example <Tabs items={["npm", "yarn"]}><Tab value="npm">...</Tab></Tabs>
 */
export interface TabsProps {
	items: string[]
	defaultValue?: string
	children: ReactNode
}

export function Tabs({ items, defaultValue, children }: TabsProps) {
	const [active, setActive] = useState(defaultValue || items[0] || "")
	const id = useId()
	const tabsRef = useRef<HTMLDivElement>(null)

	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLDivElement>) => {
			const currentIndex = items.indexOf(active)
			let nextIndex = currentIndex

			switch (e.key) {
				case "ArrowLeft":
					nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
					break
				case "ArrowRight":
					nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
					break
				case "Home":
					nextIndex = 0
					break
				case "End":
					nextIndex = items.length - 1
					break
				default:
					return
			}

			e.preventDefault()
			setActive(items[nextIndex]!)
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
 * @param value - matches item from parent Tabs
 * @param children - tab panel content
 */
export interface TabProps {
	value: string
	children: ReactNode
}

export function Tab({ value, children }: TabProps) {
	const context = useContext(TabsContext)
	if (!context) return null
	if (context.active !== value) return null
	return <>{children}</>
}
