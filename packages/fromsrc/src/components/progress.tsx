"use client"

interface ProgressProps {
	value: number
	max?: number
	label?: string
	size?: "sm" | "md" | "lg"
}

const sizes: Record<"sm" | "md" | "lg", string> = {
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
					<span className="text-sm text-fg" aria-hidden="true">
						{Math.round(percentage)}%
					</span>
				</div>
			)}
			<div
				className={`w-full ${sizes[size]} bg-surface rounded-full overflow-hidden`}
				role="progressbar"
				aria-valuenow={value}
				aria-valuemin={0}
				aria-valuemax={max}
				aria-label={label}
				aria-valuetext={`${Math.round(percentage)}%`}
			>
				<div
					className={`${sizes[size]} bg-accent rounded-full transition-[width] duration-300 ease-out`}
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
		<div className="my-6" role="group" aria-label="Progress steps">
			<ol className="flex items-center justify-between list-none p-0 m-0">
				{Array.from({ length: total }, (_, i) => (
					<li key={i} className="flex items-center">
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border transition-colors duration-200 ease-out ${
								i < current
									? "bg-accent border-accent text-bg"
									: i === current
										? "border-accent text-accent"
										: "border-line text-muted"
							}`}
							aria-current={i === current ? "step" : undefined}
							aria-label={`Step ${i + 1}${labels?.[i] ? `: ${labels[i]}` : ""}${i < current ? " completed" : i === current ? " current" : ""}`}
						>
							{i + 1}
						</div>
						{i < total - 1 && (
							<div
								className={`w-8 h-0.5 transition-colors duration-200 ease-out ${i < current ? "bg-accent" : "bg-line"}`}
								aria-hidden="true"
							/>
						)}
					</li>
				))}
			</ol>
			{labels?.[current] && (
				<div className="text-center mt-3 text-sm text-muted" aria-live="polite">
					{labels[current]}
				</div>
			)}
		</div>
	)
}

export type { ProgressProps, ProgressStepsProps }
