"use client"

import { memo, useCallback, useEffect, useState } from "react"
import type { JSX } from "react"

/**
 * Theme preference value
 */
export type Theme = "light" | "dark" | "system"

/**
 * Props for the ThemeToggle component
 */
export interface ThemeToggleProps {
	/**
	 * Initial theme when no preference is stored
	 */
	defaultTheme?: Theme
}

function istheme(value: string | null): value is Theme {
	return value === "light" || value === "dark" || value === "system"
}

function resolves(theme: Theme): "light" | "dark" {
	if (theme === "system") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
	}
	return theme
}

function ThemeToggleBase({ defaultTheme = "dark" }: ThemeToggleProps): JSX.Element {
	const [theme, setTheme] = useState<Theme | null>(null)
	const [resolved, setResolved] = useState<"light" | "dark" | null>(null)

	useEffect(() => {
		const raw = localStorage.getItem("theme")
		const initial = istheme(raw) ? raw : defaultTheme
		setTheme(initial)
		setResolved(resolves(initial))
	}, [defaultTheme])

	useEffect(() => {
		if (!theme) return

		const apply = (): void => {
			const r = resolves(theme)
			setResolved(r)
			document.documentElement.classList.toggle("dark", r === "dark")
		}

		apply()
		localStorage.setItem("theme", theme)

		if (theme === "system") {
			const media = window.matchMedia("(prefers-color-scheme: dark)")
			media.addEventListener("change", apply)
			return () => media.removeEventListener("change", apply)
		}
	}, [theme])

	const toggle = useCallback((): void => {
		setTheme((t) => (t === "dark" ? "light" : "dark"))
	}, [])

	if (!resolved) {
		return (
			<button
				type="button"
				className="p-2 text-muted hover:text-fg transition-colors"
				aria-label="toggle theme"
				disabled
			>
				<span className="size-4 block" />
			</button>
		)
	}

	return (
		<button
			type="button"
			onClick={toggle}
			className="p-2 text-muted hover:text-fg transition-colors"
			aria-label={`switch to ${resolved === "dark" ? "light" : "dark"} theme`}
		>
			{resolved === "dark" ? (
				<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-4">
					<path d="M8 12a4 4 0 100-8 4 4 0 000 8zM8 0a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V.75A.75.75 0 018 0zm0 13a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 13zM3.05 2.343a.75.75 0 011.06 0l1.061 1.061a.75.75 0 01-1.06 1.06L3.05 3.404a.75.75 0 010-1.06zm8.84 8.84a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.061l-1.06-1.06a.75.75 0 010-1.06zM16 8a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0116 8zM3 8a.75.75 0 01-.75.75H.75a.75.75 0 010-1.5h1.5A.75.75 0 013 8zm10.657-4.95a.75.75 0 010 1.061l-1.06 1.06a.75.75 0 11-1.061-1.06l1.06-1.06a.75.75 0 011.06 0zm-8.84 8.84a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 11-1.061-1.06l1.06-1.06a.75.75 0 011.06 0z" />
				</svg>
			) : (
				<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-4">
					<path d="M9.598 1.591a.75.75 0 01.785-.175 7 7 0 11-8.967 8.967.75.75 0 01.961-.96 5.5 5.5 0 007.046-7.046.75.75 0 01.175-.786zm1.616 1.945a7 7 0 01-7.678 7.678 5.5 5.5 0 107.678-7.678z" />
				</svg>
			)}
		</button>
	)
}

export const ThemeToggle = memo(ThemeToggleBase)
