"use client"

import { memo, useEffect, useRef, useState } from "react"
import type { JSX, ReactNode } from "react"

export interface PageTransitionProps {
	children: ReactNode
	className?: string
	duration?: number
	mode?: "fade" | "slide" | "none"
}

function PageTransitionBase({
	children,
	className,
	duration = 200,
	mode = "fade",
}: PageTransitionProps): JSX.Element {
	const [displayed, setDisplayed] = useState<ReactNode>(children)
	const [visible, setVisible] = useState(true)
	const prevRef = useRef<ReactNode>(children)

	useEffect((): void | (() => void) => {
		if (prevRef.current === children) return
		prevRef.current = children

		if (mode === "none") {
			setDisplayed(children)
			return
		}

		setVisible(false)
		const timer = setTimeout((): void => {
			setDisplayed(children)
			setVisible(true)
		}, duration)
		return (): void => clearTimeout(timer)
	}, [children, duration, mode])

	const style: React.CSSProperties =
		mode === "none"
			? {}
			: {
					transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
					opacity: visible ? 1 : 0,
					transform:
						mode === "slide" ? (visible ? "translateY(0)" : "translateY(8px)") : undefined,
				}

	return (
		<div className={className} style={style}>
			{displayed}
		</div>
	)
}

export const PageTransition = memo(PageTransitionBase)
