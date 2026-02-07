"use client"

import { useCallback, useEffect, useState } from "react"

export function useHash(): [string, (hash: string) => void] {
	const [hash, setHash] = useState("")

	useEffect(() => {
		setHash(window.location.hash)

		function handle() {
			setHash(window.location.hash)
		}

		window.addEventListener("hashchange", handle)
		return () => window.removeEventListener("hashchange", handle)
	}, [])

	const updateHash = useCallback((newHash: string) => {
		const formatted = newHash.startsWith("#") ? newHash : `#${newHash}`
		window.location.hash = formatted
	}, [])

	return [hash, updateHash]
}
