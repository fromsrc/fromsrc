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
	const radiusClass =
		rounded === true ? "rounded" : rounded === false ? "" : `rounded-${rounded}`

	return (
		<div
			className={`animate-pulse bg-surface ${radiusClass} ${className}`}
			style={{
				width: typeof width === "number" ? `${width}px` : width,
				height: typeof height === "number" ? `${height}px` : height,
			}}
			aria-hidden="true"
		/>
	)
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
	return (
		<div className="space-y-2">
			{Array.from({ length: lines }, (_, i) => (
				<Skeleton
					key={i}
					width={i === lines - 1 ? "75%" : "100%"}
					height="0.875rem"
				/>
			))}
		</div>
	)
}

export function SkeletonCard() {
	return (
		<div className="space-y-3 rounded-lg border border-line p-4">
			<Skeleton width="60%" height="1.25rem" />
			<SkeletonText lines={2} />
		</div>
	)
}
