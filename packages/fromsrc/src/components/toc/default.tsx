"use client"

import { useEffect, useRef, useState } from "react"
import type { Heading } from "./hook"
import { buildZigzagPath, getItemOffset, ZigzagLine } from "./zigzag"

interface Props {
	headings: Heading[]
	active: string
	activeRange: string[]
	zigzag?: boolean
}

export function TocDefault({ headings, active, activeRange, zigzag }: Props) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [svg, setSvg] = useState<{ path: string; width: number; height: number } | null>(null)
	const [thumb, setThumb] = useState({ top: 0, height: 0 })

	const range = activeRange.length > 0 ? activeRange : active ? [active] : []
	const isActive = (id: string) => range.includes(id)

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
		if (!zigzag || !containerRef.current || range.length === 0) return

		const container = containerRef.current
		let upper = Infinity
		let lower = 0

		for (const id of range) {
			const element = container.querySelector(`a[href="#${id}"]`) as HTMLElement | null
			if (!element) continue

			const styles = getComputedStyle(element)
			const top = element.offsetTop + parseFloat(styles.paddingTop)
			const bottom = element.offsetTop + element.clientHeight - parseFloat(styles.paddingBottom)

			upper = Math.min(upper, top)
			lower = Math.max(lower, bottom)
		}

		if (upper !== Infinity) {
			setThumb({ top: upper, height: lower - upper })
		}
	}, [range, zigzag])

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
							className="absolute w-full bg-fg transition-[top,height] duration-150"
							style={{ top: thumb.top, height: thumb.height }}
						/>
					</div>
				)}

				<div ref={containerRef} className="flex flex-col relative">
					{headings.map((heading, i) => (
						<a
							key={heading.id}
							href={`#${heading.id}`}
							aria-current={isActive(heading.id) ? "true" : undefined}
							className={`relative py-1.5 text-sm transition-colors ${
								isActive(heading.id) ? "text-fg" : "text-muted hover:text-fg"
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
		<nav aria-label="table of contents" className="border-l border-line">
			<ul className="space-y-1">
				{headings.map((heading) => (
					<li key={heading.id}>
						<a
							href={`#${heading.id}`}
							aria-current={isActive(heading.id) ? "true" : undefined}
							className={`block text-xs py-1 transition-colors border-l -ml-px ${
								heading.level === 3 ? "pl-6" : "pl-4"
							} ${
								isActive(heading.id)
									? "text-fg border-fg"
									: "text-muted hover:text-fg border-transparent"
							}`}
						>
							{heading.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	)
}
