export type ArrowDirection = "vertical" | "horizontal" | "both"

export interface ArrowNavOptions {
	count: number
	current: number
	direction?: ArrowDirection
	wrap?: boolean
	isDisabled?: (index: number) => boolean
}

export function getNextIndex(key: string, options: ArrowNavOptions): number {
	const { count, current, direction = "vertical", wrap = true, isDisabled } = options
	if (count === 0) return -1

	const isUp = key === "ArrowUp" || (direction !== "vertical" && key === "ArrowLeft")
	const isDown = key === "ArrowDown" || (direction !== "vertical" && key === "ArrowRight")
	const isHome = key === "Home"
	const isEnd = key === "End"

	if (!isUp && !isDown && !isHome && !isEnd) return current

	let next = current

	if (isHome) {
		next = 0
		if (isDisabled) {
			while (next < count && isDisabled(next)) next++
			if (next >= count) return current
		}
		return next
	}

	if (isEnd) {
		next = count - 1
		if (isDisabled) {
			while (next >= 0 && isDisabled(next)) next--
			if (next < 0) return current
		}
		return next
	}

	const step = isDown ? 1 : -1

	if (isDisabled) {
		let attempts = 0
		do {
			next += step
			if (wrap) {
				next = (next + count) % count
			} else if (next < 0 || next >= count) {
				return current
			}
			attempts++
		} while (isDisabled(next) && attempts < count)
		return attempts >= count ? current : next
	}

	next += step
	if (wrap) {
		next = (next + count) % count
	} else if (next < 0 || next >= count) {
		return current
	}
	return next
}
