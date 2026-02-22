"use client"

import { memo, useCallback, useEffect, useRef, useState } from "react"

export interface TocProgressProps {
	headings: { id: string; text: string; level: number }[]
	className?: string
	activeClassName?: string
	lineColor?: string
}

const indent = (level: number) => (level >= 4 ? "pl-8" : level === 3 ? "pl-4" : "")

function TocProgressBase({ headings, className, activeClassName, lineColor }: TocProgressProps) {
	const [active, setActive] = useState("")
	const listRef = useRef<HTMLUListElement>(null)
	const [indicator, setIndicator] = useState({ top: 0, height: 0 })

	useEffect(() => {
		if (headings.length === 0) return
		const elements = headings
			.map((h) => document.getElementById(h.id))
			.filter((el): el is HTMLElement => el !== null)
		if (elements.length === 0) return

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActive(entry.target.id)
						break
					}
				}
			},
			{ rootMargin: "-80px 0px -60% 0px", threshold: 0 },
		)
		for (const el of elements) observer.observe(el)
		return () => observer.disconnect()
	}, [headings])

	useEffect(() => {
		if (!active || !listRef.current) return
		const current = listRef.current.querySelector(`a[href="#${active}"]`)
		const link = current instanceof HTMLElement ? current : null
		if (!link) return
		const top = listRef.current.getBoundingClientRect().top
		const rect = link.getBoundingClientRect()
		setIndicator({ top: rect.top - top, height: rect.height })
	}, [active])

	const scroll = useCallback((id: string) => {
		document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
	}, [])

	return (
		<nav aria-label="Table of contents" className={`relative ${className || ""}`}>
			<div className="absolute left-0 top-0 bottom-0 w-0.5 bg-line" aria-hidden="true" />
			<div
				className={`absolute left-0 w-0.5 transition-all duration-200 ${activeClassName || "bg-fg"}`}
				style={{ top: indicator.top, height: indicator.height, backgroundColor: lineColor }}
				aria-hidden="true"
			/>
			<ul ref={listRef} role="list">
				{headings.map((h) => (
					<li key={h.id}>
						<a
							href={`#${h.id}`}
							onClick={(e) => {
								e.preventDefault()
								scroll(h.id)
							}}
							aria-current={active === h.id ? "location" : undefined}
							className={`block py-1 pl-4 text-sm transition-colors ${indent(h.level)} ${
								active === h.id ? "text-fg font-medium" : "text-muted hover:text-fg"
							}`}
						>
							{h.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	)
}

export const TocProgress = memo(TocProgressBase)
