"use client"

import { useEffect, useRef, useState } from "react"
import type { Heading } from "./hook"
import { buildZigzagPath, getItemOffset, ZigzagLine } from "./zigzag"

interface Props {
	headings: Heading[]
	active: string
	zigzag?: boolean
}

export function TocMinimal({ headings, active, zigzag }: Props) {
	const containerRef = useRef<HTMLDivElement>(null)
	const thumbRef = useRef<HTMLDivElement>(null)
	const progressRef = useRef<HTMLDivElement>(null)
	const [svg, setSvg] = useState<{ path: string; width: number; height: number } | null>(null)

	useEffect(() => {
		if (!zigzag || !containerRef.current || headings.length === 0) return

		const container = containerRef.current

		function update() {
			const result = buildZigzagPath(headings, container)
			if (result) setSvg(result)
		}

		const observer = new ResizeObserver(update)
		update()
		observer.observe(container)

		return () => observer.disconnect()
	}, [headings, zigzag])

	useEffect(() => {
		const container = containerRef.current
		const thumb = thumbRef.current
		const progress = progressRef.current
		if (!container) return

		let ticking = false

		function update() {
			const scrollTop = window.scrollY
			const docHeight = document.documentElement.scrollHeight - window.innerHeight
			const percent = docHeight > 0 ? scrollTop / docHeight : 0

			if (progress) {
				progress.style.height = `${percent * 100}%`
			} else if (thumb && container) {
				const containerHeight = container.offsetHeight
				const thumbHeight = 12
				const maxTop = containerHeight - thumbHeight
				const y = percent * maxTop
				thumb.style.transform = `translateY(${y}px)`
			}
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
		window.addEventListener("resize", update, { passive: true })
		return () => {
			window.removeEventListener("scroll", onScroll)
			window.removeEventListener("resize", update)
		}
	}, [svg])

	if (zigzag) {
		return (
			<nav aria-label="table of contents" className="relative">
				{svg && (
					<div
						className="absolute left-0 top-0 pointer-events-none z-10"
						style={{
							width: svg.width,
							height: svg.height,
							maskImage: `url("data:image/svg+xml,${encodeURIComponent(
								`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svg.width} ${svg.height}"><path d="${svg.path}" stroke="black" stroke-width="1" fill="none" /></svg>`,
							)}")`,
						}}
					>
						<div
							ref={progressRef}
							className="w-full bg-fg transition-[height] duration-100 ease-out"
						/>
					</div>
				)}

				<div ref={containerRef} className="flex flex-col">
					{headings.map((heading, i) => (
						<a
							key={heading.id}
							href={`#${heading.id}`}
							aria-current={active === heading.id ? "true" : undefined}
							className={`relative py-1.5 text-sm transition-colors ${
								active === heading.id ? "text-fg" : "text-muted hover:text-fg"
							}`}
							style={{ paddingLeft: getItemOffset(heading.level) }}
						>
							<ZigzagLine
								heading={heading}
								upper={headings[i - 1]?.level}
								lower={headings[i + 1]?.level}
							/>
							{heading.text}
						</a>
					))}
				</div>
			</nav>
		)
	}

	return (
		<nav aria-label="table of contents" className="flex gap-3">
			<div ref={containerRef} className="relative w-0.5 bg-line rounded-full">
				<div
					ref={thumbRef}
					className="absolute left-0 top-0 w-full h-3 bg-fg rounded-full"
					style={{ willChange: "transform" }}
				/>
			</div>
			<ul className="space-y-1">
				{headings.map((heading) => (
					<li key={heading.id}>
						<a
							href={`#${heading.id}`}
							aria-current={active === heading.id ? "true" : undefined}
							className={`block text-xs py-1 transition-colors ${
								heading.level === 3 ? "pl-2" : ""
							} ${active === heading.id ? "text-fg" : "text-muted hover:text-fg"}`}
						>
							{heading.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	)
}
