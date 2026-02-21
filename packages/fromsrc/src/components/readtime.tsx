import { memo, type JSX } from "react"
import { calcReadTime } from "../readtime"

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
	const minutes = calcReadTime(content, wpm)

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

export { calcReadTime }
