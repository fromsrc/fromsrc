import { memo, type JSX } from "react"

/**
 * Props for the Spinner component.
 * @property size - Spinner dimensions (sm, md, lg)
 * @property className - Additional CSS classes
 * @property aria-hidden - Hide from screen readers when used decoratively
 */
export interface SpinnerProps {
	size?: "sm" | "md" | "lg"
	className?: string
	"aria-hidden"?: boolean | "true" | "false"
}

const sizes: Record<NonNullable<SpinnerProps["size"]>, string> = {
	sm: "size-4",
	md: "size-6",
	lg: "size-8",
}

/**
 * Animated spinner indicating loading state.
 * @example <Spinner size="sm" />
 */
export const Spinner = memo(function Spinner({
	size = "md",
	className = "",
	"aria-hidden": ariaHidden,
}: SpinnerProps): JSX.Element {
	return (
		<svg
			className={`animate-spin will-change-transform ${sizes[size]} ${className}`}
			viewBox="0 0 24 24"
			fill="none"
			role="status"
			aria-label={ariaHidden ? undefined : "Loading"}
			aria-hidden={ariaHidden}
		>
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	)
})

/**
 * Props for the Loading component.
 * @property text - Loading message to display
 * @property size - Spinner size (sm, md, lg)
 */
export interface LoadingProps {
	text?: string
	size?: "sm" | "md" | "lg"
}

/**
 * Loading indicator with optional text message.
 * @example <Loading text="Fetching data..." />
 */
export const Loading = memo(function Loading({
	text,
	size = "md",
}: LoadingProps): JSX.Element {
	return (
		<div
			role="status"
			aria-live="polite"
			aria-label={text || "Loading"}
			className="flex items-center justify-center gap-2 text-muted"
		>
			<Spinner size={size} aria-hidden="true" />
			{text && <span className="text-sm">{text}</span>}
		</div>
	)
})
