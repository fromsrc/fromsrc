"use client"

import { Search } from "fromsrc/client"

export function SearchModal() {
	return <Search basePath="/docs" endpoint="/api/search" hidden />
}
