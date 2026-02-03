"use client"

import {
	Children,
	createContext,
	isValidElement,
	type ReactElement,
	type ReactNode,
	useContext,
	useState,
} from "react"

interface TabsContextValue {
	active: string
	setActive: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

export interface TabsProps {
	items: string[]
	defaultValue?: string
	children: ReactNode
}

export function Tabs({ items, defaultValue, children }: TabsProps) {
	const [active, setActive] = useState(defaultValue || items[0] || "")

	return (
		<TabsContext.Provider value={{ active, setActive }}>
			<div className="my-6">
				<div className="flex border-b border-line">
					{items.map((item) => (
						<button
							key={item}
							type="button"
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
				<div className="pt-4">{children}</div>
			</div>
		</TabsContext.Provider>
	)
}

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
