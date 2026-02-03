"use client"

import type { DocMeta } from "fromsrc"
import { Search } from "fromsrc/client"

interface Props {
	docs: DocMeta[]
}

export function SearchModal({ docs }: Props) {
	return <Search basePath="/docs" docs={docs} hidden />
}
