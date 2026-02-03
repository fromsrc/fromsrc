import type { ReactNode } from "react"

interface Props {
	children: ReactNode
	className?: string
}

export function Kbd({ children, className = "" }: Props) {
	return (
		<kbd
			className={`inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 text-xs font-mono bg-surface border border-line rounded shadow-sm text-muted ${className}`}
		>
			{children}
		</kbd>
	)
}

export function Shortcut({ keys }: { keys: string[] }) {
	return (
		<span className="inline-flex items-center gap-0.5">
			{keys.map((key, i) => (
				<span key={key} className="contents">
					{i > 0 && <span className="text-muted/50 mx-0.5">+</span>}
					<Kbd>{key}</Kbd>
				</span>
			))}
		</span>
	)
}
