import type { ReactNode } from "react"

interface Props {
	children: ReactNode
	className?: string
}

export function Note({ children, className = "" }: Props) {
	return (
		<aside
			className={`my-4 pl-4 border-l-2 border-muted/30 text-sm text-muted italic ${className}`}
		>
			{children}
		</aside>
	)
}

export function Important({ children, className = "" }: Props) {
	return (
		<aside
			className={`my-4 pl-4 border-l-2 border-amber-500/50 text-sm text-amber-200/80 ${className}`}
		>
			{children}
		</aside>
	)
}

export function Experimental({ children, className = "" }: Props) {
	return (
		<aside
			className={`my-4 px-4 py-3 rounded-lg bg-purple-500/5 border border-purple-500/20 text-sm text-purple-200/80 ${className}`}
		>
			<span className="text-[10px] uppercase tracking-wider text-purple-400 font-medium">
				experimental
			</span>
			<div className="mt-1">{children}</div>
		</aside>
	)
}
