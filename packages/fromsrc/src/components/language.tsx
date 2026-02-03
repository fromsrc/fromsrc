"use client"

import { Languages, Check } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export interface Locale {
	code: string
	name: string
	flag?: string
}

export interface LanguageSwitchProps {
	current: string
	locales: Locale[]
	onChange?: (code: string) => void
}

export function LanguageSwitch({ current, locales, onChange }: LanguageSwitchProps) {
	const [open, setOpen] = useState(false)
	const [index, setIndex] = useState(0)
	const ref = useRef<HTMLDivElement>(null)

	const currentLocale = locales.find((l) => l.code === current)

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}

		document.addEventListener("click", handleClick)
		return () => document.removeEventListener("click", handleClick)
	}, [])

	function handleKeyDown(e: React.KeyboardEvent) {
		if (!open) {
			if (e.key === "Enter" || e.key === " ") {
				setOpen(true)
				e.preventDefault()
			}
			return
		}

		switch (e.key) {
			case "Escape":
				setOpen(false)
				break
			case "ArrowDown":
				setIndex((i) => Math.min(i + 1, locales.length - 1))
				e.preventDefault()
				break
			case "ArrowUp":
				setIndex((i) => Math.max(i - 1, 0))
				e.preventDefault()
				break
			case "Enter":
				onChange?.(locales[index].code)
				setOpen(false)
				break
		}
	}

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				onKeyDown={handleKeyDown}
				aria-expanded={open}
				aria-haspopup="listbox"
				className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted hover:bg-surface hover:text-fg transition-colors"
			>
				<Languages className="size-4" aria-hidden />
				<span>{currentLocale?.name ?? current}</span>
			</button>

			{open && (
				<div
					role="listbox"
					className="absolute right-0 top-full mt-1 min-w-[140px] rounded-md border border-line bg-bg p-1 shadow-lg"
				>
					{locales.map((locale, i) => (
						<button
							key={locale.code}
							type="button"
							role="option"
							aria-selected={locale.code === current}
							onClick={() => {
								onChange?.(locale.code)
								setOpen(false)
							}}
							onMouseEnter={() => setIndex(i)}
							className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
								i === index ? "bg-surface text-fg" : "text-muted hover:bg-surface hover:text-fg"
							}`}
						>
							{locale.flag && <span>{locale.flag}</span>}
							<span className="flex-1 text-left">{locale.name}</span>
							{locale.code === current && <Check className="size-4" aria-hidden />}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
