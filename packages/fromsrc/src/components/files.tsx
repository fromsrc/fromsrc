"use client"

import { type ReactNode, useState } from "react"

export interface FilesProps {
	children: ReactNode
}

export function Files({ children }: FilesProps) {
	return (
		<div className="my-6 rounded-lg border border-line bg-fg/[0.02] p-2 font-mono text-sm">
			{children}
		</div>
	)
}

export interface FileProps {
	name: string
	icon?: ReactNode
}

export function File({ name, icon }: FileProps) {
	return (
		<div className="flex items-center gap-2 px-2 py-1 text-muted">
			{icon || (
				<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-4 shrink-0">
					<path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75z" />
				</svg>
			)}
			{name}
		</div>
	)
}

export interface FolderProps {
	name: string
	children?: ReactNode
	defaultOpen?: boolean
}

export function Folder({ name, children, defaultOpen = false }: FolderProps) {
	const [open, setOpen] = useState(defaultOpen)

	return (
		<div>
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="flex w-full items-center gap-2 px-2 py-1 text-left text-fg hover:bg-fg/5 rounded"
			>
				<svg
					aria-hidden="true"
					viewBox="0 0 16 16"
					fill="currentColor"
					className={`size-4 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
				>
					<path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
				</svg>
				<svg
					aria-hidden="true"
					viewBox="0 0 16 16"
					fill="currentColor"
					className="size-4 shrink-0 text-yellow-500"
				>
					<path d="M.513 1.513A1.75 1.75 0 011.75 1h3.5c.55 0 1.07.26 1.4.7l.9 1.2a.25.25 0 00.2.1h6.5A1.75 1.75 0 0116 4.75v8.5A1.75 1.75 0 0114.25 15H1.75A1.75 1.75 0 010 13.25V2.75c0-.465.186-.91.513-1.237z" />
				</svg>
				{name}
			</button>
			{open && children && <div className="ml-4 border-l border-line pl-2">{children}</div>}
		</div>
	)
}
