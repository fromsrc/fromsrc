"use client"

import type { DocMeta } from "fromsrc"
import { useKeyboardNav } from "fromsrc/client"

interface Props {
	docs: DocMeta[]
	basePath?: string
}

export function KeyboardNav({ docs, basePath = "/docs" }: Props) {
	useKeyboardNav(docs, basePath)
	return null
}
