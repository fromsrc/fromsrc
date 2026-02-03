import type { ReactNode } from "react"

interface KbdProps {
	children: ReactNode
	className?: string
}

export function Kbd({ children, className = "" }: KbdProps) {
	return (
		<kbd
			className={`inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 text-xs font-mono bg-surface border border-line rounded shadow-sm text-muted ${className}`}
		>
			{children}
		</kbd>
	)
}

interface ShortcutProps {
	keys: string[]
}

export function Shortcut({ keys }: ShortcutProps) {
	return (
		<kbd className="inline-flex items-center gap-0.5">
			{keys.map((key, i) => (
				<span key={`${i}-${key}`} className="contents">
					{i > 0 && (
						<span className="text-muted/50 mx-0.5" aria-hidden="true">
							+
						</span>
					)}
					<kbd
						className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 text-xs font-mono bg-surface border border-line rounded shadow-sm text-muted"
					>
						{key}
					</kbd>
				</span>
			))}
		</kbd>
	)
}
