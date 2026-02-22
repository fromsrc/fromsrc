"use client"

import { memo, useEffect, useMemo, useState } from "react"

type LastUpdatedProps = {
	date: string | Date
	format?: "relative" | "absolute" | "both"
	className?: string
	prefix?: string
}

function relative(d: Date): string {
	const s = Math.floor((Date.now() - d.getTime()) / 1000)
	if (s < 60) return "just now"
	const m = Math.floor(s / 60)
	if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`
	const h = Math.floor(m / 60)
	if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`
	const days = Math.floor(h / 24)
	if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`
	const months = Math.floor(days / 30)
	if (days < 365) return `${months} month${months === 1 ? "" : "s"} ago`
	const years = Math.floor(days / 365)
	return `${years} year${years === 1 ? "" : "s"} ago`
}

export type { LastUpdatedProps }

export const LastUpdated = memo(function LastUpdated({
	date,
	format = "relative",
	className,
	prefix = "Last updated",
}: LastUpdatedProps) {
	const parsed = useMemo(() => (typeof date === "string" ? new Date(date) : date), [date])
	const iso = parsed.toISOString()
	const abs = useMemo(() => parsed.toLocaleDateString(), [parsed])
	const [rel, setRel] = useState<string>("")

	useEffect(() => {
		if (format === "absolute") return
		setRel(relative(parsed))
		const timer = setInterval(() => setRel(relative(parsed)), 60_000)
		return () => clearInterval(timer)
	}, [format, parsed])

	const label = format === "absolute" ? abs : rel || abs
	const title = format === "both" ? abs : undefined

	return (
		<time dateTime={iso} className={className} title={title} suppressHydrationWarning>
			{prefix} {label}
		</time>
	)
})
