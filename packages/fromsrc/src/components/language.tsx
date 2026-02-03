"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { JSX, KeyboardEvent } from "react"
import { IconCheck, IconLanguages } from "./icons"

/**
 * Represents a locale option for language switching
 */
export interface Locale {
	code: string
	name: string
	flag?: string
}

/**
 * Props for the LanguageSwitch component
 */
export interface LanguageSwitchProps {
	current: string
	locales: Locale[]
	onChange?: (code: string) => void
}

export function LanguageSwitch({ current, locales, onChange }: LanguageSwitchProps): JSX.Element {
	const [open, setOpen] = useState<boolean>(false)
	const [index, setIndex] = useState<number>(0)
	const ref = useRef<HTMLDivElement>(null)
	const listboxId = "language-listbox"

	const currentLocale = locales.find((l) => l.code === current)

	useEffect((): (() => void) => {
		function handleClick(e: globalThis.MouseEvent): void {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}

		document.addEventListener("click", handleClick)
		return (): void => document.removeEventListener("click", handleClick)
	}, [])

	const handleToggle = useCallback((): void => {
		setOpen((prev) => !prev)
	}, [])

	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLButtonElement>): void => {
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
					onChange?.(locales[index]!.code)
					setOpen(false)
					break
			}
		},
		[open, locales, index, onChange]
	)

	const handleSelect = useCallback(
		(code: string): void => {
			onChange?.(code)
			setOpen(false)
		},
		[onChange]
	)

	const handleMouseEnter = useCallback((i: number): void => {
		setIndex(i)
	}, [])

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={handleToggle}
				onKeyDown={handleKeyDown}
				aria-expanded={open}
				aria-haspopup="listbox"
				aria-controls={open ? listboxId : undefined}
				aria-label={`Select language, current: ${currentLocale?.name ?? current}`}
				className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted hover:bg-surface hover:text-fg transition-colors"
			>
				<IconLanguages size={16} aria-hidden="true" />
				<span>{currentLocale?.name ?? current}</span>
			</button>

			{open && (
				<div
					id={listboxId}
					role="listbox"
					aria-label="Available languages"
					aria-activedescendant={`language-option-${locales[index]?.code}`}
					className="absolute right-0 top-full mt-1 min-w-[140px] rounded-md border border-line bg-bg p-1 shadow-lg"
				>
					{locales.map((locale, i) => (
						<button
							key={locale.code}
							id={`language-option-${locale.code}`}
							type="button"
							role="option"
							aria-selected={locale.code === current}
							onClick={(): void => handleSelect(locale.code)}
							onMouseEnter={(): void => handleMouseEnter(i)}
							className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
								i === index ? "bg-surface text-fg" : "text-muted hover:bg-surface hover:text-fg"
							}`}
						>
							{locale.flag && <span aria-hidden="true">{locale.flag}</span>}
							<span className="flex-1 text-left">{locale.name}</span>
							{locale.code === current && <IconCheck size={16} aria-hidden="true" />}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
