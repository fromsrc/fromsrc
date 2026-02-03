import type { ReactNode } from "react"

export interface AvatarStackProps {
	children: ReactNode
	max?: number
	size?: "sm" | "md" | "lg"
}

const sizes = {
	sm: "size-6",
	md: "size-8",
	lg: "size-10",
}

export function AvatarStack({ children, max = 5, size = "md" }: AvatarStackProps) {
	const items = Array.isArray(children) ? children : [children]
	const visible = items.slice(0, max)
	const remaining = items.length - max

	return (
		<div className="flex -space-x-2">
			{visible.map((child, i) => (
				<div
					key={i}
					className={`relative rounded-full ring-2 ring-bg ${sizes[size]}`}
					style={{ zIndex: visible.length - i }}
				>
					{child}
				</div>
			))}
			{remaining > 0 && (
				<div
					className={`relative flex items-center justify-center rounded-full bg-surface text-xs font-medium text-muted ring-2 ring-bg ${sizes[size]}`}
				>
					+{remaining}
				</div>
			)}
		</div>
	)
}
