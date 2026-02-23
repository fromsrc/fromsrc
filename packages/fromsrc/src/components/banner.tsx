"use client"

import { type ReactNode, memo, useCallback, useEffect, useState } from "react"

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

function BannerInner({
	id,
	variant = "default",
	children,
	"aria-label": ariaLabel,
}: BannerProps) {
	const [visible, setVisible] = useState<boolean | null>(() => {
		if (!id) return true
		if (typeof window === "undefined") return null
		return localStorage.getItem(`banner-${id}`) !== "true"
	})

	useEffect(() => {
		if (!id) {
			setVisible(true)
			return
		}
		setVisible(localStorage.getItem(`banner-${id}`) !== "true")
	}, [id])

	const dismiss = useCallback(() => {
		if (id) {
			localStorage.setItem(`banner-${id}`, "true")
		}
		setVisible(false)
	}, [id])

	if (visible !== true) return null

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

export const Banner = memo(BannerInner)
