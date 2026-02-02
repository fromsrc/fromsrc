"use client"

import { useKeyboardNav } from "fromsrc/client"
import type { DocMeta } from "fromsrc"

interface Props {
	docs: DocMeta[]
	basePath?: string
}

export function KeyboardNav({ docs, basePath = "/docs" }: Props) {
	useKeyboardNav(docs, basePath)
	return null
}
