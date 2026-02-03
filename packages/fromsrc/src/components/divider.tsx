import type { ComponentProps } from "react"

export type DividerProps = ComponentProps<"hr"> & {
	label?: string
}

export function Divider({ label, className, ...props }: DividerProps) {
	if (label) {
		return (
			<div
				role="separator"
				aria-label={label}
				className={className ?? "flex items-center gap-4 my-8"}
			>
				<div aria-hidden="true" className="flex-1 h-px bg-line" />
				<span className="text-xs text-muted uppercase tracking-wider">{label}</span>
				<div aria-hidden="true" className="flex-1 h-px bg-line" />
			</div>
		)
	}

	return <hr className={className ?? "border-line my-8"} {...props} />
}
