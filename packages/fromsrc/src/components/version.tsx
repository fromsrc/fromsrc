"use client"

import { Check, ChevronDown } from "lucide-react"
import { useState } from "react"

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
	const currentVersion = versions.find((v) => v.id === current)

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen(!open)}
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
					>
						{versions.map((version) => (
							<button
								key={version.id}
								type="button"
								role="option"
								aria-selected={version.id === current}
								onClick={() => {
									if (version.href) {
										window.location.href = version.href
									} else {
										onChange?.(version.id)
									}
									setOpen(false)
								}}
								className="flex items-center justify-between gap-2 w-full px-3 py-2 text-sm text-left hover:bg-bg transition-colors"
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
