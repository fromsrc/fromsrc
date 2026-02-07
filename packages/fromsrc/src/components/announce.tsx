"use client"

import { memo, useCallback, useEffect, useState } from "react"

export interface AnnounceProps {
	children: React.ReactNode
	dismissible?: boolean
	storageKey?: string
	className?: string
}

export const Announce = memo(function Announce({
	children,
	dismissible = true,
	storageKey = "fromsrc-announce",
	className,
}: AnnounceProps) {
	const [dismissed, setDismissed] = useState(true)

	useEffect(() => {
		setDismissed(localStorage.getItem(storageKey) === "1")
	}, [storageKey])

	const dismiss = useCallback(() => {
		localStorage.setItem(storageKey, "1")
		setDismissed(true)
	}, [storageKey])

	if (dismissed) return null

	return (
		<div className={`flex items-center justify-center bg-accent px-4 py-2 text-sm text-white ${className ?? ""}`}>
			<span className="flex-1 text-center">{children}</span>
			{dismissible && (
				<button type="button" onClick={dismiss} className="ml-2 shrink-0 p-1 opacity-70 hover:opacity-100">
					<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			)}
		</div>
	)
})
