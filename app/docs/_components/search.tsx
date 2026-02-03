"use client"

import { Search } from "fromsrc/client"
import type { DocMeta } from "fromsrc"

interface Props {
	docs: DocMeta[]
}

export function SearchModal({ docs }: Props) {
	return <Search basePath="/docs" docs={docs} />
}
