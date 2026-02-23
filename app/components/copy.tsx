"use client"

import { useState } from "react"

export function Copy({ text, className = "" }: { text: string; className?: string }) {
	const [copied, setCopied] = useState(false)
	const [hovered, setHovered] = useState(false)

	const copy = () => {
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true)
			setTimeout(() => setCopied(false), 1000)
		}).catch(() => {})
	}

	return (
		<button
			type="button"
			onClick={copy}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			aria-label={copied ? "copied" : `copy ${text}`}
			className={`group relative cursor-pointer ${className}`}
		>
			{text}
			<span
				className={`absolute -right-5 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${
					hovered || copied ? "opacity-100" : "opacity-0"
				}`}
				aria-hidden="true"
			>
				<svg
					className={`size-3 transition-colors duration-200 ${copied ? "text-accent" : "text-fg"}`}
					viewBox="0 0 24 24"
					fill="currentColor"
					aria-hidden="true"
				>
					<rect x="3" y="4" width="18" height="2" rx="1" />
					<rect x="9" y="11" width="12" height="2" rx="1" />
					<rect x="15" y="18" width="6" height="2" rx="1" />
				</svg>
			</span>
		</button>
	)
}
