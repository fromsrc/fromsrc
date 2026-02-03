"use client"

interface ProgressProps {
	value: number
	max?: number
	label?: string
	size?: "sm" | "md" | "lg"
}

const sizes = {
	sm: "h-1",
	md: "h-2",
	lg: "h-3",
}

export function Progress({ value, max = 100, label, size = "md" }: ProgressProps) {
	const percentage = Math.min(100, Math.max(0, (value / max) * 100))

	return (
		<div className="my-4">
			{label && (
				<div className="flex justify-between mb-2">
					<span className="text-sm text-muted">{label}</span>
					<span className="text-sm text-fg">{Math.round(percentage)}%</span>
				</div>
			)}
			<div
				className={`w-full ${sizes[size]} bg-surface rounded-full overflow-hidden`}
				role="progressbar"
				aria-valuenow={value}
				aria-valuemin={0}
				aria-valuemax={max}
			>
				<div
					className={`${sizes[size]} bg-accent rounded-full transition-all duration-300`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	)
}

interface ProgressStepsProps {
	current: number
	total: number
	labels?: string[]
}

export function ProgressSteps({ current, total, labels }: ProgressStepsProps) {
	return (
		<div className="my-6">
			<div className="flex items-center justify-between">
				{Array.from({ length: total }, (_, i) => (
					<div key={i} className="flex items-center">
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border ${
								i < current
									? "bg-accent border-accent text-bg"
									: i === current
										? "border-accent text-accent"
										: "border-line text-muted"
							}`}
						>
							{i + 1}
						</div>
						{i < total - 1 && (
							<div
								className={`w-8 h-0.5 ${i < current ? "bg-accent" : "bg-line"}`}
							/>
						)}
					</div>
				))}
			</div>
			{labels && labels[current] && (
				<div className="text-center mt-3 text-sm text-muted">{labels[current]}</div>
			)}
		</div>
	)
}

export type { ProgressProps, ProgressStepsProps }
