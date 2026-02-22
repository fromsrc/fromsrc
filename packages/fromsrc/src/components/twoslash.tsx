"use client"

import { memo } from "react"
import { z } from "zod"

const row = z.object({
	t: z.enum(["q", "c"]),
	l: z.number().int().nonnegative(),
	ch: z.number().int().nonnegative(),
	tx: z.string().optional(),
})

const rows = z.array(row)

type item = {
	type: "query" | "completion"
	line: number
	character: number
	text?: string
}

export interface TwoslashProps {
	data?: string
	noerrors?: boolean
}

function read(data?: string): item[] {
	if (!data) return []
	try {
		const raw: unknown = JSON.parse(data)
		const parsed = rows.safeParse(raw)
		if (!parsed.success) return []
		return parsed.data.map((value) => ({
			type: value.t === "q" ? "query" : "completion",
			line: value.l,
			character: value.ch,
			text: value.tx,
		}))
	} catch {
		return []
	}
}

const TwoslashBase = memo(function TwoslashBase({ data, noerrors }: TwoslashProps) {
	const items = read(data)
	if (items.length === 0 && !noerrors) return null
	return (
		<div className="border-t border-line/60 bg-surface/40 px-4 py-3 text-xs text-muted" aria-label="TypeScript notes">
			{noerrors ? <div className="mb-2 text-green-400">no errors expected</div> : null}
			{items.length > 0 ? (
				<ul className="space-y-1" role="list">
					{items.map((value, index) => (
						<li key={`${value.type}-${value.line}-${value.character}-${index}`} className="font-mono">
							<span className="text-fg">{value.type}</span>{" "}
							<span className="text-dim">line {value.line + 1}, col {value.character + 1}</span>
							{value.text ? <span className="text-muted">: {value.text}</span> : null}
						</li>
					))}
				</ul>
			) : null}
		</div>
	)
})

export const Twoslash = TwoslashBase
