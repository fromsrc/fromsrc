"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

export type ThemeMode = "light" | "dark" | "system"

export type ThemeContextValue = {
	theme: ThemeMode
	resolved: "light" | "dark"
	setTheme: (theme: ThemeMode) => void
}

export type ThemeProviderProps = {
	children: ReactNode
	defaultTheme?: ThemeMode
	storageKey?: string
	attribute?: string
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function istheme(value: string | null): value is ThemeMode {
	return value === "light" || value === "dark" || value === "system"
}

function resolve(theme: ThemeMode): "light" | "dark" {
	if (theme === "system") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
	}
	return theme
}

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "fromsrc-theme",
	attribute = "data-theme",
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<ThemeMode>(() => {
		if (typeof window === "undefined") return defaultTheme
		const stored = localStorage.getItem(storageKey)
		return istheme(stored) ? stored : defaultTheme
	})
	const [resolved, setResolved] = useState<"light" | "dark">(() => {
		if (typeof window === "undefined") return "light"
		return resolve(theme)
	})

	useEffect(() => {
		const r = resolve(theme)
		setResolved(r)
		document.documentElement.setAttribute(attribute, r)
		document.documentElement.classList.toggle("dark", r === "dark")
		localStorage.setItem(storageKey, theme)
	}, [theme, attribute, storageKey])

	useEffect(() => {
		if (theme !== "system") return
		const media = window.matchMedia("(prefers-color-scheme: dark)")
		const handler = () => {
			const r = resolve(theme)
			setResolved(r)
			document.documentElement.setAttribute(attribute, r)
			document.documentElement.classList.toggle("dark", r === "dark")
		}
		media.addEventListener("change", handler)
		return () => media.removeEventListener("change", handler)
	}, [theme, attribute])

	const value = useMemo<ThemeContextValue>(() => ({ theme, resolved, setTheme }), [theme, resolved])

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
	const context = useContext(ThemeContext)
	if (!context) throw new Error("useTheme must be used within ThemeProvider")
	return context
}
