"use client"

import { memo, useCallback, useRef, useState } from "react"

export interface PreLinkProps {
	href: string
	children: React.ReactNode
	className?: string
}

function domain(href: string): string | null {
	try {
		return new URL(href).hostname.replace("www.", "")
	} catch {
		return null
	}
}

function external(href: string): boolean {
	return href.startsWith("http") && !href.includes(window.location.hostname)
}

export const PreLink = memo(function PreLink({ href, children, className }: PreLinkProps) {
	const [visible, setVisible] = useState(false)
	const showTimer = useRef<ReturnType<typeof setTimeout>>(null)
	const hideTimer = useRef<ReturnType<typeof setTimeout>>(null)

	const enter = useCallback(() => {
		if (hideTimer.current) clearTimeout(hideTimer.current)
		showTimer.current = setTimeout(() => setVisible(true), 300)
	}, [])

	const leave = useCallback(() => {
		if (showTimer.current) clearTimeout(showTimer.current)
		hideTimer.current = setTimeout(() => setVisible(false), 100)
	}, [])

	const host = domain(href)
	const isExternal = typeof window !== "undefined" && external(href)

	return (
		<span className="relative inline" onMouseEnter={enter} onMouseLeave={leave}>
			<a href={href} className={className} target={host ? "_blank" : undefined} rel={host ? "noopener noreferrer" : undefined}>
				{children}
			</a>
			{visible && host && (
				<span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-lg border border-line bg-surface p-3 shadow-lg pointer-events-none">
					<span className="text-sm font-medium text-fg block truncate">{typeof children === "string" ? children : host}</span>
					<span className="text-xs text-muted mt-1 block truncate">{href}</span>
					<span className="text-xs text-dim mt-2 flex items-center gap-1">
						{isExternal && (
							<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
								<polyline points="15 3 21 3 21 9" />
								<line x1="10" y1="14" x2="21" y2="3" />
							</svg>
						)}
						{host}
					</span>
				</span>
			)}
		</span>
	)
})
