"use client"

import type { JSX, ReactNode } from "react"
import { IconCheck, IconCircle, IconX } from "./icons"

interface ListProps {
	children: ReactNode
}

export function CheckList({ children }: ListProps): JSX.Element {
	return (
		<ul className="my-4 space-y-2" role="list">
			{children}
		</ul>
	)
}

interface CheckItemProps {
	checked?: boolean
	children: ReactNode
}

export function CheckItem({ checked = true, children }: CheckItemProps): JSX.Element {
	return (
		<li className="flex items-start gap-2" aria-label={checked ? "included" : "not included"}>
			{checked ? (
				<IconCheck size={16} className="mt-0.5 text-emerald-400 shrink-0" />
			) : (
				<IconX size={16} className="mt-0.5 text-red-400 shrink-0" />
			)}
			<span className="text-sm text-muted">{children}</span>
		</li>
	)
}

export function BulletList({ children }: ListProps): JSX.Element {
	return (
		<ul className="my-4 space-y-2" role="list">
			{children}
		</ul>
	)
}

interface BulletItemProps {
	children: ReactNode
}

export function BulletItem({ children }: BulletItemProps): JSX.Element {
	return (
		<li className="flex items-start gap-2">
			<IconCircle size={6} className="mt-2 text-muted shrink-0" />
			<span className="text-sm text-muted">{children}</span>
		</li>
	)
}

interface NumberListProps {
	start?: number
	children: ReactNode
}

export function NumberList({ start = 1, children }: NumberListProps): JSX.Element {
	return (
		<ol className="my-4 space-y-2 list-none" start={start} role="list">
			{children}
		</ol>
	)
}

interface NumberItemProps {
	number: number
	children: ReactNode
}

export function NumberItem({ number, children }: NumberItemProps): JSX.Element {
	return (
		<li className="flex items-start gap-3" value={number}>
			<span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-surface border border-line text-xs font-medium text-muted">
				{number}
			</span>
			<span className="text-sm text-muted pt-0.5">{children}</span>
		</li>
	)
}
