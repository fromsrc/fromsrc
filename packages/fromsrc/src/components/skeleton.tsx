export interface SkeletonProps {
	width?: string | number
	height?: string | number
	rounded?: boolean | string
	className?: string
}

export function Skeleton({
	width,
	height = "1rem",
	rounded = "md",
	className = "",
}: SkeletonProps) {
	const radiusClass = rounded === true ? "rounded" : rounded === false ? "" : `rounded-${rounded}`

	return (
		<div
			className={`animate-pulse bg-surface ${radiusClass} ${className}`}
			style={{
				width: typeof width === "number" ? `${width}px` : width,
				height: typeof height === "number" ? `${height}px` : height,
				willChange: "opacity",
			}}
			aria-hidden="true"
		/>
	)
}

export interface SkeletonTextProps {
	lines?: number
	standalone?: boolean
}

export function SkeletonText({ lines = 3, standalone = true }: SkeletonTextProps) {
	return (
		<div
			className="space-y-2"
			{...(standalone && { role: "status", "aria-busy": true, "aria-label": "Loading" })}
		>
			{Array.from({ length: lines }, (_, i) => (
				<Skeleton key={i} width={i === lines - 1 ? "75%" : "100%"} height="0.875rem" />
			))}
		</div>
	)
}

export function SkeletonCard() {
	return (
		<div
			className="space-y-3 rounded-lg border border-line p-4"
			role="status"
			aria-busy="true"
			aria-label="Loading"
		>
			<Skeleton width="60%" height="1.25rem" />
			<SkeletonText lines={2} standalone={false} />
		</div>
	)
}
