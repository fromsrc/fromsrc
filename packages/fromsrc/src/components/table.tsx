"use client"

import { type ReactNode, memo, useCallback, useId, useMemo, useState } from "react"

/**
 * Sort direction for table columns
 */
export type SortDirection = "asc" | "desc" | null

/**
 * Column definition for the table
 * @template T - Row data type
 */
export interface TableColumn<T> {
	key: keyof T & string
	header: string
	sortable?: boolean
	width?: string
	render?: (value: T[keyof T], row: T) => ReactNode
	hideOnMobile?: boolean
}

/**
 * Props for the Table component
 * @template T - Row data type extending Record<string, unknown>
 */
export interface TableProps<T extends Record<string, unknown>> {
	data: T[]
	columns: TableColumn<T>[]
	defaultSort?: keyof T & string
	defaultDirection?: SortDirection
	striped?: boolean
	hoverable?: boolean
	compact?: boolean
	caption?: string
	className?: string
}

export function Table<T extends Record<string, unknown>>({
	data,
	columns,
	defaultSort,
	defaultDirection = "asc",
	striped = false,
	hoverable = true,
	compact = false,
	caption,
	className = "",
}: TableProps<T>): ReactNode {
	const [sortKey, setSortKey] = useState<(keyof T & string) | null>(defaultSort ?? null)
	const [sortDir, setSortDir] = useState<SortDirection>(defaultSort ? defaultDirection : null)
	const id = useId()

	const sorted = useMemo((): T[] => {
		if (!sortKey || !sortDir) return data
		return [...data].sort((a, b) => {
			const va = a[sortKey]
			const vb = b[sortKey]
			if (va === vb) return 0
			if (va == null) return 1
			if (vb == null) return -1
			const cmp = va < vb ? -1 : 1
			return sortDir === "asc" ? cmp : -cmp
		})
	}, [data, sortKey, sortDir])

	const handleSort = useCallback(
		(key: keyof T & string): void => {
			if (sortKey === key) {
				setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc")
				if (sortDir === "desc") setSortKey(null)
			} else {
				setSortKey(key)
				setSortDir("asc")
			}
		},
		[sortKey, sortDir]
	)

	const padding = compact ? "px-3 py-2" : "px-4 py-3"

	const getSortLabel = useCallback(
		(col: TableColumn<T>): string => {
			if (sortKey === col.key) {
				if (sortDir === "asc") return `${col.header}, sorted ascending`
				if (sortDir === "desc") return `${col.header}, sorted descending`
			}
			return `${col.header}, sortable`
		},
		[sortKey, sortDir]
	)

	return (
		<div
			className={`my-6 overflow-x-auto rounded-lg border border-line ${className}`.trim()}
			role="region"
			aria-label={caption || "Data table"}
			tabIndex={0}
		>
			<table
				className="w-full text-sm"
				aria-rowcount={data.length + 1}
				aria-colcount={columns.length}
			>
				{caption && (
					<caption id={`${id}-caption`} className="sr-only">
						{caption}
					</caption>
				)}
				<thead className="bg-surface">
					<tr>
						{columns.map((col, colIndex) => (
							<th
								key={col.key}
								scope="col"
								aria-colindex={colIndex + 1}
								style={col.width ? { width: col.width } : undefined}
								className={`text-left ${padding} font-medium text-fg ${col.hideOnMobile ? "hidden sm:table-cell" : ""}`}
								aria-sort={
									col.sortable && sortKey === col.key && sortDir
										? sortDir === "asc"
											? "ascending"
											: "descending"
										: undefined
								}
							>
								{col.sortable ? (
									<button
										type="button"
										onClick={() => handleSort(col.key)}
										aria-label={getSortLabel(col)}
										className="inline-flex items-center gap-1.5 transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded"
									>
										{col.header}
										<SortIcon
											active={sortKey === col.key}
											direction={sortKey === col.key ? sortDir : null}
										/>
									</button>
								) : (
									col.header
								)}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{sorted.map((row, i) => (
						<tr
							key={i}
							aria-rowindex={i + 2}
							className={`border-t border-line/50 ${striped && i % 2 === 1 ? "bg-surface/30" : ""} ${hoverable ? "hover:bg-surface/50" : ""}`}
						>
							{columns.map((col, colIndex) => (
								<td
									key={col.key}
									aria-colindex={colIndex + 1}
									className={`${padding} text-muted ${col.hideOnMobile ? "hidden sm:table-cell" : ""}`}
								>
									{col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

/**
 * Sort indicator icon props
 */
interface SortIconProps {
	active: boolean
	direction: SortDirection
}

const SortIcon = memo(function SortIcon({ active, direction }: SortIconProps): ReactNode {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="currentColor"
			className={`size-3.5 transition-colors ${active && direction ? "text-accent" : "text-muted/50"}`}
		>
			{direction === "asc" ? (
				<path d="M8 4l4 5H4l4-5z" />
			) : direction === "desc" ? (
				<path d="M8 12l-4-5h8l-4 5z" />
			) : (
				<>
					<path d="M8 4l3 3.5H5L8 4z" opacity={0.5} />
					<path d="M8 12l-3-3.5h6L8 12z" opacity={0.5} />
				</>
			)}
		</svg>
	)
})
