/**
 * @param size - spinner dimensions
 * @param className - additional classes
 * @example <Spinner size="sm" />
 */
export interface SpinnerProps {
	size?: "sm" | "md" | "lg"
	className?: string
}

const sizes = {
	sm: "size-4",
	md: "size-6",
	lg: "size-8",
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
	return (
		<svg
			className={`animate-spin will-change-transform ${sizes[size]} ${className}`}
			viewBox="0 0 24 24"
			fill="none"
			role="status"
			aria-label="loading"
			aria-hidden="true"
		>
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	)
}

/**
 * @param text - loading message
 * @param size - spinner size
 * @example <Loading text="fetching..." />
 */
export interface LoadingProps {
	text?: string
	size?: "sm" | "md" | "lg"
}

export function Loading({ text, size = "md" }: LoadingProps) {
	return (
		<div
			role="status"
			aria-live="polite"
			aria-label={text || "loading"}
			className="flex items-center justify-center gap-2 text-muted"
		>
			<Spinner size={size} />
			{text && <span className="text-sm">{text}</span>}
		</div>
	)
}
