import { memo, type JSX } from "react"

/**
 * Props for the ReadTime component
 */
interface Props {
	/** markdown or text content to calculate reading time from */
	content: string
	/** words per minute reading speed (default: 200) */
	wpm?: number
	/** additional css classes */
	className?: string
}

export const ReadTime = memo(function ReadTime({
	content,
	wpm = 200,
	className,
}: Props): JSX.Element {
	const words = content.trim().split(/\s+/).length
	const minutes = Math.max(1, Math.ceil(words / wpm))

	return (
		<span
			className={`text-dim text-sm ${className || ""}`}
			role="text"
			aria-label={`Estimated reading time: ${minutes} ${minutes === 1 ? "minute" : "minutes"}`}
		>
			{minutes} min read
		</span>
	)
})

/**
 * Calculate reading time in minutes
 */
export function calcReadTime(content: string, wpm = 200): number {
	const words = content.trim().split(/\s+/).length
	return Math.max(1, Math.ceil(words / wpm))
}
