import { type ComponentProps, type JSX, memo } from "react"

/**
 * Props for the Divider component
 */
export interface DividerProps extends ComponentProps<"hr"> {
	/**
	 * Optional label displayed in the center of the divider
	 */
	label?: string
}

function DividerBase({ label, className, ...props }: DividerProps): JSX.Element {
	if (label) {
		return (
			<div
				role="separator"
				aria-label={label}
				className={className ?? "flex items-center gap-4 my-8"}
			>
				<hr aria-hidden="true" className="flex-1 border-0 h-px bg-line m-0" />
				<span className="text-xs text-muted uppercase tracking-wider">{label}</span>
				<hr aria-hidden="true" className="flex-1 border-0 h-px bg-line m-0" />
			</div>
		)
	}

	return <hr className={className ?? "border-line my-8"} {...props} />
}

/**
 * Horizontal divider with optional centered label
 */
export const Divider = memo(DividerBase)
