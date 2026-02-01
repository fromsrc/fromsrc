"use client"

import { useState, type ReactNode } from "react"

export interface TypeInfo {
	type: string
	default?: string
	description?: ReactNode
	required?: boolean
}

export interface TypeTableProps {
	data: Record<string, TypeInfo>
}

export function TypeTable({ data }: TypeTableProps) {
	const entries = Object.entries(data)
	if (entries.length === 0) return null

	return (
		<div className="my-6 rounded-lg border border-line overflow-hidden">
			<table className="w-full text-sm">
				<thead className="bg-surface">
					<tr>
						<th className="text-left px-4 py-3 font-medium text-fg">prop</th>
						<th className="text-left px-4 py-3 font-medium text-fg">type</th>
						<th className="text-left px-4 py-3 font-medium text-fg hidden sm:table-cell">
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
}

function TypeRow({ name, info }: { name: string; info: TypeInfo }) {
	const [open, setOpen] = useState(false)

	return (
		<>
			<tr
				className="border-t border-line/50 hover:bg-surface/50 cursor-pointer"
				onClick={() => setOpen(!open)}
			>
				<td className="px-4 py-3">
					<code className="text-xs bg-surface px-1.5 py-0.5 rounded text-fg">
						{name}
						{!info.required && <span className="text-muted">?</span>}
					</code>
				</td>
				<td className="px-4 py-3 text-muted font-mono text-xs">{info.type}</td>
				<td className="px-4 py-3 text-muted text-xs hidden sm:table-cell">
					{info.default || "-"}
				</td>
			</tr>
			{open && info.description && (
				<tr className="border-t border-line/30 bg-surface/30">
					<td colSpan={3} className="px-4 py-3 text-sm text-muted">
						{info.description}
					</td>
				</tr>
			)}
		</>
	)
}
