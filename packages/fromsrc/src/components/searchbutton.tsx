"use client"

import { memo, useEffect, useState } from "react"

export interface SearchButtonProps {
	onClick: () => void
	className?: string
	placeholder?: string
}

export const SearchButton = memo(function SearchButton({
	onClick,
	className = "",
	placeholder = "Search...",
}: SearchButtonProps) {
	const [modifier, setModifier] = useState("Ctrl")

	useEffect(() => {
		const ua = (navigator as any).userAgentData
		const platform = ua?.platform ?? navigator.platform ?? ""
		if (/mac/i.test(platform)) setModifier("\u2318")
	}, [])

	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-neutral-300 ${className}`}
		>
			<svg
				aria-hidden="true"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<circle cx="11" cy="11" r="8" />
				<path d="m21 21-4.3-4.3" />
			</svg>
			<span className="flex-1 text-left">{placeholder}</span>
			<kbd className="rounded border border-neutral-200 px-1.5 py-0.5 text-xs font-medium dark:border-neutral-700">
				{modifier}+K
			</kbd>
		</button>
	)
})
