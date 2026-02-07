"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface InfiniteScrollResult {
	ref: React.RefObject<HTMLElement | null>
	loading: boolean
	done: boolean
	setDone: (done: boolean) => void
}

export function useInfiniteScroll(
	onLoadMore: () => Promise<void>,
	threshold = 200,
): InfiniteScrollResult {
	const ref = useRef<HTMLElement | null>(null)
	const [loading, setLoading] = useState(false)
	const [done, setDone] = useState(false)
	const loadingRef = useRef(false)

	const handleScroll = useCallback(() => {
		if (loadingRef.current || done) return

		const el = ref.current
		const target = el || document.documentElement
		const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight

		if (scrollBottom < threshold) {
			loadingRef.current = true
			setLoading(true)
			onLoadMore().finally(() => {
				loadingRef.current = false
				setLoading(false)
			})
		}
	}, [onLoadMore, threshold, done])

	useEffect(() => {
		const el = ref.current || window
		el.addEventListener("scroll", handleScroll, { passive: true })
		return () => el.removeEventListener("scroll", handleScroll)
	}, [handleScroll])

	return { ref, loading, done, setDone }
}
