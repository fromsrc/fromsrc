"use client"

import { type ReactNode, memo, useRef, useState, useEffect } from "react"

export interface ExpandCodeProps {
	children: ReactNode
	maxLines?: number
	defaultOpen?: boolean
}

const LINE_HEIGHT = 20.8

function ExpandCodeComponent({ children, maxLines = 15, defaultOpen = false }: ExpandCodeProps) {
	const contentRef = useRef<HTMLDivElement>(null)
	const [isOpen, setIsOpen] = useState(defaultOpen)
	const [needsExpand, setNeedsExpand] = useState(false)
	const [collapsedHeight, setCollapsedHeight] = useState(0)

	useEffect(() => {
		if (contentRef.current) {
			const scrollHeight = contentRef.current.scrollHeight
			const maxHeight = maxLines * LINE_HEIGHT

			if (scrollHeight > maxHeight) {
				setNeedsExpand(true)
				setCollapsedHeight(maxHeight)
			}
		}
	}, [maxLines])

	const shouldCollapse = needsExpand && !isOpen

	return (
		<div className="relative">
			<div
				ref={contentRef}
				style={{
					maxHeight: shouldCollapse ? `${collapsedHeight}px` : undefined,
					overflow: shouldCollapse ? "hidden" : undefined,
					transition: "max-height 0.3s ease",
				}}
			>
				{children}
			</div>

			{shouldCollapse && (
				<div
					className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
					style={{
						background: "linear-gradient(transparent, #0d0d0d)",
					}}
				/>
			)}

			{needsExpand && (
				<div className="flex justify-center mt-2">
					<button
						type="button"
						onClick={() => setIsOpen(!isOpen)}
						aria-expanded={isOpen}
						className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
					>
						{isOpen ? "Show less" : "Show more"}
					</button>
				</div>
			)}
		</div>
	)
}

export const ExpandCode = memo(ExpandCodeComponent)
