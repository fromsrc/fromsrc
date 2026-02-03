import { type JSX, type ReactNode, memo } from "react"

/**
 * props for a single keyboard key display
 */
interface KbdProps {
	children: ReactNode
	className?: string
}

function KbdBase({ children, className = "" }: KbdProps): JSX.Element {
	return (
		<kbd
			className={`inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 text-xs font-mono bg-surface border border-line rounded shadow-sm text-muted ${className}`}
		>
			{children}
		</kbd>
	)
}

export const Kbd = memo(KbdBase)

/**
 * props for a keyboard shortcut with multiple keys
 */
interface ShortcutProps {
	keys: string[]
}

function ShortcutBase({ keys }: ShortcutProps): JSX.Element {
	const label = keys.join(" + ")

	return (
		<kbd className="inline-flex items-center gap-0.5" aria-label={label} role="group">
			{keys.map((key, i) => (
				<span key={`${i}-${key}`} className="contents">
					{i > 0 && (
						<span className="text-muted/50 mx-0.5" aria-hidden="true">
							+
						</span>
					)}
					<kbd
						className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 text-xs font-mono bg-surface border border-line rounded shadow-sm text-muted"
						aria-hidden="true"
					>
						{key}
					</kbd>
				</span>
			))}
		</kbd>
	)
}

export const Shortcut = memo(ShortcutBase)
