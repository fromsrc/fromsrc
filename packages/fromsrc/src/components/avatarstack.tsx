import { type ReactNode, memo } from "react"
import type { JSX } from "react"

/**
 * Props for the AvatarStack component.
 */
export interface AvatarStackProps {
	/** Avatar elements to display in the stack */
	children: ReactNode
	/** Maximum number of avatars to show before truncating */
	max?: number
	/** Size variant for all avatars */
	size?: "sm" | "md" | "lg"
	/** Accessible label describing the avatar group */
	label?: string
}

const sizes: Record<"sm" | "md" | "lg", string> = {
	sm: "size-6",
	md: "size-8",
	lg: "size-10",
}

function AvatarStackBase({
	children,
	max = 5,
	size = "md",
	label,
}: AvatarStackProps): JSX.Element {
	const items = Array.isArray(children) ? children : [children]
	const visible = items.slice(0, max)
	const remaining = items.length - max
	const total = items.length

	return (
		<div
			className="flex -space-x-2"
			role="group"
			aria-label={label ?? `${total} avatars`}
		>
			{visible.map((child, i) => (
				<div
					key={i}
					className={`relative rounded-full ring-2 ring-bg ${sizes[size]}`}
					style={{ zIndex: visible.length - i }}
					role="img"
					aria-hidden="true"
				>
					{child}
				</div>
			))}
			{remaining > 0 && (
				<div
					className={`relative flex items-center justify-center rounded-full bg-surface text-xs font-medium text-muted ring-2 ring-bg ${sizes[size]}`}
					aria-label={`${remaining} more`}
				>
					+{remaining}
				</div>
			)}
		</div>
	)
}

/**
 * A stacked avatar display showing overlapping avatars with overflow count.
 */
export const AvatarStack = memo(AvatarStackBase)
