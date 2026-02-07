"use client"

import { useEffect, useState } from "react"

export function usePreferredLanguage(): string {
	const [lang, setLang] = useState("en")

	useEffect(() => {
		setLang(navigator.language || "en")

		function handler() {
			setLang(navigator.language || "en")
		}

		window.addEventListener("languagechange", handler)
		return () => window.removeEventListener("languagechange", handler)
	}, [])

	return lang
}
