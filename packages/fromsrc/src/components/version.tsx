"use client"

import { Check, ChevronDown } from "lucide-react"
import { useRef, useState } from "react"

interface Version {
	id: string
	label: string
	href?: string
}

interface VersionSelectProps {
	versions: Version[]
	current: string
	onChange?: (version: string) => void
}

export function VersionSelect({ versions, current, onChange }: VersionSelectProps) {
	const [open, setOpen] = useState(false)
	const [focused, setFocused] = useState(-1)
	const containerRef = useRef<HTMLDivElement>(null)
	const currentVersion = versions.find((v) => v.id === current)
	const currentIndex = versions.findIndex((v) => v.id === current)

	const selectVersion = (version: Version) => {
		if (version.href) {
			window.location.href = version.href
		} else {
			onChange?.(version.id)
		}
		setOpen(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!open) {
			if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
				e.preventDefault()
				setOpen(true)
				setFocused(currentIndex >= 0 ? currentIndex : 0)
			}
			return
		}

		if (e.key === "Escape") {
			e.preventDefault()
			setOpen(false)
			setFocused(-1)
		} else if (e.key === "ArrowDown") {
			e.preventDefault()
			setFocused((f) => Math.min(f + 1, versions.length - 1))
		} else if (e.key === "ArrowUp") {
			e.preventDefault()
			setFocused((f) => Math.max(f - 1, 0))
		} else if (e.key === "Enter" || e.key === " ") {
			e.preventDefault()
			if (focused >= 0 && versions[focused]) {
				selectVersion(versions[focused])
			}
		} else if (e.key === "Home") {
			e.preventDefault()
			setFocused(0)
		} else if (e.key === "End") {
			e.preventDefault()
			setFocused(versions.length - 1)
		}
	}

	return (
		<div className="relative" ref={containerRef}>
			<button
				type="button"
				onClick={() => {
					setOpen(!open)
					if (!open) setFocused(currentIndex >= 0 ? currentIndex : 0)
				}}
				onKeyDown={handleKeyDown}
				onBlur={(e) => {
					if (!containerRef.current?.contains(e.relatedTarget)) {
						setOpen(false)
						setFocused(-1)
					}
				}}
				className="flex items-center gap-2 px-3 py-1.5 text-sm bg-surface border border-line rounded-lg hover:bg-surface/80 transition-colors"
				aria-expanded={open}
				aria-haspopup="listbox"
			>
				<span className="text-fg">{currentVersion?.label || current}</span>
				<ChevronDown
					size={14}
					className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
					aria-hidden="true"
				/>
			</button>
			{open && (
				<>
					<div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
					<div
						className="absolute left-0 top-full mt-1 z-50 min-w-[120px] py-1 bg-surface border border-line rounded-lg shadow-lg"
						role="listbox"
						tabIndex={-1}
						aria-activedescendant={focused >= 0 ? `version-${versions[focused]?.id}` : undefined}
					>
						{versions.map((version, i) => (
							<button
								key={version.id}
								id={`version-${version.id}`}
								type="button"
								role="option"
								aria-selected={version.id === current}
								onClick={() => selectVersion(version)}
								onKeyDown={handleKeyDown}
								onFocus={() => setFocused(i)}
								className={`flex items-center justify-between gap-2 w-full px-3 py-2 text-sm text-left hover:bg-bg transition-colors ${
									i === focused ? "bg-bg" : ""
								}`}
							>
								<span className={version.id === current ? "text-fg" : "text-muted"}>
									{version.label}
								</span>
								{version.id === current && (
									<Check size={14} className="text-accent" aria-hidden="true" />
								)}
							</button>
						))}
					</div>
				</>
			)}
		</div>
	)
}

export type { Version, VersionSelectProps }
