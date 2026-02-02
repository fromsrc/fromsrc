interface Props {
	content: string
	wpm?: number
	className?: string
}

export function ReadTime({ content, wpm = 200, className }: Props) {
	const words = content.trim().split(/\s+/).length
	const minutes = Math.max(1, Math.ceil(words / wpm))

	return (
		<span className={`text-dim text-sm ${className || ""}`}>
			{minutes} min read
		</span>
	)
}

export function calcReadTime(content: string, wpm = 200): number {
	const words = content.trim().split(/\s+/).length
	return Math.max(1, Math.ceil(words / wpm))
}
