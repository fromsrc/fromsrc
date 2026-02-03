"use client"

import { type ReactNode, memo, useState } from "react"

/**
 * @description metadata for a single property in the type table
 */
export interface TypeInfo {
	type: string
	default?: string
	description?: ReactNode
	required?: boolean
}

/**
 * @description props for the typetable component
 */
export interface TypeTableProps {
	data: Record<string, TypeInfo>
}

/**
 * @description props for an individual row in the type table
 */
interface TypeRowProps {
	name: string
	info: TypeInfo
}

export const TypeTable = memo(function TypeTable({ data }: TypeTableProps): ReactNode {
	const entries = Object.entries(data)
	if (entries.length === 0) return null

	return (
		<div className="my-6 rounded-lg border border-line overflow-hidden">
			<table className="w-full text-sm" role="grid" aria-label="property types">
				<thead className="bg-surface">
					<tr role="row">
						<th scope="col" className="text-left px-4 py-3 font-medium text-fg">
							prop
						</th>
						<th scope="col" className="text-left px-4 py-3 font-medium text-fg">
							type
						</th>
						<th
							scope="col"
							className="text-left px-4 py-3 font-medium text-fg hidden sm:table-cell"
						>
							default
						</th>
					</tr>
				</thead>
				<tbody>
					{entries.map(([name, info]) => (
						<TypeRow key={name} name={name} info={info} />
					))}
				</tbody>
			</table>
		</div>
	)
})

const TypeRow = memo(function TypeRow({ name, info }: TypeRowProps): ReactNode {
	const [open, setOpen] = useState(false)
	const rowId = `typerow-${name}`
	const descId = `typedesc-${name}`

	return (
		<>
			<tr
				role="row"
				className="border-t border-line/50 hover:bg-surface/50 cursor-pointer"
				onClick={(): void => setOpen(!open)}
				onKeyDown={(e): void => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault()
						setOpen(!open)
					}
				}}
				tabIndex={0}
				aria-expanded={info.description ? open : undefined}
				aria-controls={info.description ? descId : undefined}
				id={rowId}
			>
				<td className="px-4 py-3" role="gridcell">
					<code className="text-xs bg-surface px-1.5 py-0.5 rounded text-fg">
						{name}
						{!info.required && (
							<span className="text-muted" aria-label="optional">
								?
							</span>
						)}
					</code>
				</td>
				<td className="px-4 py-3 text-muted font-mono text-xs" role="gridcell">
					{info.type}
				</td>
				<td className="px-4 py-3 text-muted text-xs hidden sm:table-cell" role="gridcell">
					{info.default || "-"}
				</td>
			</tr>
			{open && info.description && (
				<tr
					role="row"
					className="border-t border-line/30 bg-surface/30"
					id={descId}
					aria-labelledby={rowId}
				>
					<td colSpan={3} className="px-4 py-3 text-sm text-muted" role="gridcell">
						{info.description}
					</td>
				</tr>
			)}
		</>
	)
})
