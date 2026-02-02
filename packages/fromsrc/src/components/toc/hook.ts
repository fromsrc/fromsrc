"use client"

import { useEffect, useState } from "react"

export interface Heading {
	id: string
	text: string
	level: number
}

export interface TocState {
	headings: Heading[]
	active: string
	activeRange: string[]
	progress: number
}

export function useToc(multi = false): TocState {
	const [headings, setHeadings] = useState<Heading[]>([])
	const [active, setActive] = useState<string>("")
	const [activeRange, setActiveRange] = useState<string[]>([])
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		function scan() {
			const elements = document.querySelectorAll("article h2, article h3")
			const items: Heading[] = []

			elements.forEach((el) => {
				if (el.id) {
					items.push({
						id: el.id,
						text: el.textContent || "",
						level: el.tagName === "H2" ? 2 : 3,
					})
				}
			})

			if (items.length > 0) {
				setHeadings(items)
			}
		}

		scan()

		const observer = new MutationObserver(() => {
			scan()
		})

		const article = document.querySelector("article")
		if (article) {
			observer.observe(article, { childList: true, subtree: true })
		}

		return () => observer.disconnect()
	}, [])

	useEffect(() => {
		if (headings.length === 0) return

		if (multi) {
			const visible = new Set<string>()

			const observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							visible.add(entry.target.id)
						} else {
							visible.delete(entry.target.id)
						}
					}

					if (visible.size === 0) {
						const first = headings[0]
						if (first) {
							setActive(first.id)
							setActiveRange([first.id])
						}
					} else {
						const ordered = headings.filter((h) => visible.has(h.id))
						setActive(ordered[0]?.id || "")
						setActiveRange(ordered.map((h) => h.id))
					}
				},
				{ rootMargin: "0px", threshold: 0.5 }
			)

			for (const { id } of headings) {
				const el = document.getElementById(id)
				if (el) observer.observe(el)
			}

			return () => observer.disconnect()
		}

			let ticking = false

		function update() {
			const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
			const scrolled = scrollHeight > 0 ? Math.min(window.scrollY / scrollHeight, 1) : 0
			setProgress(scrolled)

			const atBottom =
				window.innerHeight + Math.ceil(window.scrollY) >= document.documentElement.scrollHeight

			if (atBottom) {
				setActive(headings[headings.length - 1].id)
				return
			}

			const offset = 100
			let current = ""
			const items = headings.slice(0, -1)

			for (const { id } of items) {
				const el = document.getElementById(id)
				if (!el) continue
				if (el.getBoundingClientRect().top <= offset) {
					current = id
				}
			}

			if (!current && headings.length > 0) {
				current = headings[0].id
			}

			setActive(current)
		}

		function onScroll() {
			if (!ticking) {
				requestAnimationFrame(() => {
					update()
					ticking = false
				})
				ticking = true
			}
		}

		update()
		window.addEventListener("scroll", onScroll, { passive: true })
		return () => window.removeEventListener("scroll", onScroll)
	}, [headings, multi])

	return { headings, active, activeRange, progress }
}
