import type { ReactNode } from "react"

export type line = {
	num: number
	content: ReactNode
}

export type file = {
	name: string
	lines: line[]
	raw: string
}
