"use client"

import { type ReactNode, useEffect, useState } from "react"

export type BannerVariant = "default" | "rainbow"

/**
 * @param id - unique id for dismiss persistence
 * @param variant - visual style
 * @param children - banner content
 * @example <Banner id="sale" variant="rainbow">50% off</Banner>
 */
export interface BannerProps {
	id?: string
	variant?: BannerVariant
	children: ReactNode
	"aria-label"?: string
}

export function Banner({
	id,
	variant = "default",
	children,
	"aria-label": ariaLabel,
}: BannerProps) {
	const [mounted, setMounted] = useState(false)
	const [visible, setVisible] = useState(true)

	useEffect(() => {
		setMounted(true)
		if (id) {
			const dismissed = localStorage.getItem(`banner-${id}`)
			if (dismissed === "true") {
				setVisible(false)
			}
		}
	}, [id])

	if (!mounted || !visible) return null

	function dismiss() {
		if (id) {
			localStorage.setItem(`banner-${id}`, "true")
		}
		setVisible(false)
	}

	const base = "sticky top-0 z-40 flex items-center justify-center gap-2 px-4 py-2 text-sm"
	const styles: Record<BannerVariant, string> = {
		default: "bg-fg/5 text-fg",
		rainbow: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white",
	}

	return (
		<div
			role="status"
			aria-label={ariaLabel}
			aria-live="polite"
			className={`${base} ${styles[variant]}`}
		>
			<span className="text-center">{children}</span>
			{id && (
				<button
					type="button"
					onClick={dismiss}
					onKeyDown={(e) => {
						if (e.key === "Escape") dismiss()
					}}
					className="absolute right-4 rounded p-1 opacity-60 hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
					aria-label="Dismiss banner"
				>
					<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-4">
						<path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
					</svg>
				</button>
			)}
		</div>
	)
}
