import { type JSX, memo } from "react"

/**
 * Props for the Skeleton component
 */
export interface SkeletonProps {
	/** Width of the skeleton (px if number, raw value if string) */
	width?: string | number
	/** Height of the skeleton (px if number, raw value if string) */
	height?: string | number
	/** Border radius - true for default, false for none, string for tailwind size */
	rounded?: boolean | string
	/** Additional CSS classes */
	className?: string
	/** Accessible label for screen readers */
	label?: string
}

export const Skeleton = memo(function Skeleton({
	width,
	height = "1rem",
	rounded = "md",
	className = "",
	label = "Loading",
}: SkeletonProps): JSX.Element {
	const radiusClass = rounded === true ? "rounded" : rounded === false ? "" : `rounded-${rounded}`

	return (
		<div
			className={`animate-pulse bg-surface ${radiusClass} ${className}`}
			style={{
				width: typeof width === "number" ? `${width}px` : width,
				height: typeof height === "number" ? `${height}px` : height,
				willChange: "opacity",
			}}
			role="status"
			aria-busy="true"
			aria-label={label}
		/>
	)
})

/**
 * Props for the SkeletonText component
 */
export interface SkeletonTextProps {
	/** Number of text lines to display */
	lines?: number
	/** Whether this is a standalone loading indicator */
	standalone?: boolean
	/** Accessible label for screen readers */
	label?: string
}

export const SkeletonText = memo(function SkeletonText({
	lines = 3,
	standalone = true,
	label = "Loading",
}: SkeletonTextProps): JSX.Element {
	return (
		<div
			className="space-y-2"
			{...(standalone && { role: "status", "aria-busy": true, "aria-label": label })}
		>
			{Array.from({ length: lines }, (_, i) => (
				<Skeleton key={i} width={i === lines - 1 ? "75%" : "100%"} height="0.875rem" label="" />
			))}
		</div>
	)
})

/**
 * Props for the SkeletonCard component
 */
export interface SkeletonCardProps {
	/** Accessible label for screen readers */
	label?: string
}

export const SkeletonCard = memo(function SkeletonCard({
	label = "Loading",
}: SkeletonCardProps): JSX.Element {
	return (
		<div
			className="space-y-3 rounded-lg border border-line p-4"
			role="status"
			aria-busy="true"
			aria-label={label}
		>
			<Skeleton width="60%" height="1.25rem" label="" />
			<SkeletonText lines={2} standalone={false} />
		</div>
	)
})
