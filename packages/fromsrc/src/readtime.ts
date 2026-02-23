export function calcReadTime(content: string, wpm = 200): number {
	const text = content.trim()
	if (!text) return 0
	const words = text.split(/\s+/).length
	return Math.max(1, Math.ceil(words / wpm))
}
