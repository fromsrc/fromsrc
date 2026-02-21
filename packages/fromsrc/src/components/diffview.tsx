"use client"

import { type ReactNode, memo, useMemo } from "react"

export interface DiffViewProps {
	before: string
	after: string
	lang?: string
	title?: string
	mode?: "unified" | "split"
}

type DiffLine = {
	type: "add" | "remove" | "context"
	content: string
	beforeNum?: number
	afterNum?: number
}

function computediff(before: string, after: string): DiffLine[] {
	const beforelines = before.split("\n")
	const afterlines = after.split("\n")
	const m = beforelines.length
	const n = afterlines.length
	const lcs: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const row = lcs[i]
			const prevrow = lcs[i - 1]
			if (!row || !prevrow) continue
			const diag = prevrow[j - 1] ?? 0
			const up = prevrow[j] ?? 0
			const left = row[j - 1] ?? 0
			if (beforelines[i - 1] === afterlines[j - 1]) {
				row[j] = diag + 1
			} else {
				row[j] = Math.max(up, left)
			}
		}
	}

	const result: DiffLine[] = []
	let i = m
	let j = n
	let beforenum = m
	let afternum = n

	while (i > 0 || j > 0) {
		if (i > 0 && j > 0 && beforelines[i - 1] === afterlines[j - 1]) {
			const content = beforelines[i - 1]
			if (content === undefined) break
			result.unshift({ type: "context", content, beforeNum: beforenum, afterNum: afternum })
			i--
			j--
			beforenum--
			afternum--
		} else if (
			j > 0 &&
			(i === 0 || (lcs[i]?.[j - 1] ?? 0) >= (lcs[i - 1]?.[j] ?? 0))
		) {
			const content = afterlines[j - 1]
			if (content === undefined) break
			result.unshift({ type: "add", content, afterNum: afternum })
			j--
			afternum--
		} else if (i > 0) {
			const content = beforelines[i - 1]
			if (content === undefined) break
			result.unshift({ type: "remove", content, beforeNum: beforenum })
			i--
			beforenum--
		}
	}

	return result
}

const containerstyle = {
	position: "relative" as const,
	margin: "24px 0",
	borderRadius: "8px",
	backgroundColor: "#0d0d0d",
	border: "1px solid #1c1c1c",
	overflow: "hidden",
}

const headerstyle = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	padding: "0 16px",
	height: "40px",
	backgroundColor: "#161b22",
	borderBottom: "1px solid #1c1c1c",
}

const titlestyle = {
	fontSize: "0.8rem",
	fontFamily: "ui-monospace, monospace",
	color: "#a0a0a0",
}

const linestyle = {
	display: "flex",
	fontFamily: "ui-monospace, monospace",
	fontSize: "13px",
	lineHeight: "1.6",
}

const linenumstyle = {
	display: "inline-block",
	width: "40px",
	padding: "0 8px",
	textAlign: "right" as const,
	color: "#4a4a4a",
	userSelect: "none" as const,
}

function DiffLineComponent({ line, showBefore }: { line: DiffLine; showBefore?: boolean }): ReactNode {
	const num = showBefore ? line.beforeNum : line.afterNum || line.beforeNum
	const bg =
		line.type === "add"
			? "rgba(46, 160, 67, 0.15)"
			: line.type === "remove"
				? "rgba(248, 81, 73, 0.15)"
				: "transparent"
	const color = line.type === "add" ? "#3fb950" : line.type === "remove" ? "#f85149" : "#e6edf3"
	const prefix = line.type === "add" ? "+ " : line.type === "remove" ? "- " : ""

	return (
		<div style={{ ...linestyle, backgroundColor: bg }}>
			<span style={linenumstyle}>{num}</span>
			<span style={{ paddingLeft: "8px", paddingRight: "16px", flex: 1 }}>
				<span style={{ color }}>
					{prefix}
					{line.content}
				</span>
			</span>
		</div>
	)
}

export const DiffView = memo(function DiffView({
	before,
	after,
	lang,
	title,
	mode = "unified",
}: DiffViewProps): ReactNode {
	const diff = useMemo(() => computediff(before, after), [before, after])
	const hasheader = title || lang

	if (mode === "split") {
		return (
			<figure role="group" style={containerstyle}>
				{hasheader && (
					<div style={headerstyle}>
						<span style={titlestyle}>{title || lang}</span>
					</div>
				)}
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "auto", maxHeight: "500px" }}>
					<div style={{ borderRight: "1px solid #1c1c1c" }}>
						{diff.map((line, idx) => line.type === "add" ? null : <DiffLineComponent key={idx} line={line} showBefore />)}
					</div>
					<div>
						{diff.map((line, idx) => line.type === "remove" ? null : <DiffLineComponent key={idx} line={line} />)}
					</div>
				</div>
			</figure>
		)
	}

	return (
		<figure role="group" style={containerstyle}>
			{hasheader && (
				<div style={headerstyle}>
					<span style={titlestyle}>{title || lang}</span>
				</div>
			)}
			<div style={{ overflow: "auto", maxHeight: "500px" }}>
				{diff.map((line, idx) => (
					<DiffLineComponent key={idx} line={line} />
				))}
			</div>
		</figure>
	)
})
