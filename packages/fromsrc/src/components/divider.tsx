"use client"

interface DividerProps {
	label?: string
}

export function Divider({ label }: DividerProps) {
	if (label) {
		return (
			<div className="flex items-center gap-4 my-8">
				<div className="flex-1 h-px bg-line" />
				<span className="text-xs text-muted uppercase tracking-wider">{label}</span>
				<div className="flex-1 h-px bg-line" />
			</div>
		)
	}

	return <hr className="border-line my-8" />
}
