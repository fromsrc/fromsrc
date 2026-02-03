"use client"

import { type KeyboardEvent, type ReactNode, useCallback, useState } from "react"

/**
 * Container for file tree display
 */
export interface FilesProps {
	children: ReactNode
	label?: string
}

/**
 * Root component for file tree structure
 */
export function Files({ children, label = "File tree" }: FilesProps): ReactNode {
	return (
		<div
			role="tree"
			aria-label={label}
			className="my-6 rounded-lg border border-line bg-fg/[0.02] p-2 font-mono text-sm"
		>
			{children}
		</div>
	)
}

/**
 * Props for individual file item
 */
export interface FileProps {
	name: string
	icon?: ReactNode
}

/**
 * Leaf node representing a single file
 */
export function File({ name, icon }: FileProps): ReactNode {
	return (
		<div
			role="treeitem"
			aria-selected={false}
			tabIndex={0}
			className="flex items-center gap-2 px-2 py-1 text-muted rounded focus:outline-none focus:ring-1 focus:ring-fg/20"
		>
			{icon || (
				<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-4 shrink-0">
					<path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75z" />
				</svg>
			)}
			<span>{name}</span>
		</div>
	)
}

/**
 * Props for folder item with expandable children
 */
export interface FolderProps {
	name: string
	children?: ReactNode
	defaultOpen?: boolean
}

/**
 * Expandable folder node containing child items
 */
export function Folder({ name, children, defaultOpen = false }: FolderProps): ReactNode {
	const [open, setOpen] = useState(defaultOpen)

	const toggle = useCallback((): void => {
		setOpen((prev) => !prev)
	}, [])

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLButtonElement>): void => {
			switch (event.key) {
				case "ArrowRight":
					if (!open) {
						setOpen(true)
						event.preventDefault()
					}
					break
				case "ArrowLeft":
					if (open) {
						setOpen(false)
						event.preventDefault()
					}
					break
				case "ArrowDown":
					{
						const next = event.currentTarget.closest("[role=treeitem]")?.nextElementSibling
						const focusable = next?.querySelector("button, [tabindex='0']") as HTMLElement | null
						focusable?.focus()
						event.preventDefault()
					}
					break
				case "ArrowUp":
					{
						const prev = event.currentTarget.closest("[role=treeitem]")?.previousElementSibling
						const focusable = prev?.querySelector("button, [tabindex='0']") as HTMLElement | null
						focusable?.focus()
						event.preventDefault()
					}
					break
				case "Enter":
				case " ":
					toggle()
					event.preventDefault()
					break
				case "Home":
					{
						const tree = event.currentTarget.closest("[role=tree]")
						const first = tree?.querySelector("button, [tabindex='0']") as HTMLElement | null
						first?.focus()
						event.preventDefault()
					}
					break
				case "End":
					{
						const tree = event.currentTarget.closest("[role=tree]")
						const all = tree?.querySelectorAll("button, [tabindex='0']")
						const last = all?.[all.length - 1] as HTMLElement | null
						last?.focus()
						event.preventDefault()
					}
					break
			}
		},
		[open, toggle]
	)

	return (
		<div role="treeitem" aria-expanded={open}>
			<button
				type="button"
				onClick={toggle}
				onKeyDown={handleKeyDown}
				className="flex w-full items-center gap-2 px-2 py-1 text-left text-fg hover:bg-fg/5 rounded focus:outline-none focus:ring-1 focus:ring-fg/20"
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
				<span>{name}</span>
			</button>
			{open && children && (
				<div role="group" className="ml-4 border-l border-line pl-2">
					{children}
				</div>
			)}
		</div>
	)
}
