"use client"

import { type JSX, type ReactNode, memo } from "react"
import { IconCheck, IconCircle, IconX } from "./icons"

/**
 * Props for list container components
 */
interface ListProps {
	children: ReactNode
}

/**
 * Props for check list items
 */
export interface CheckItemProps {
	checked?: boolean
	children: ReactNode
}

/**
 * Props for bullet list items
 */
export interface BulletItemProps {
	children: ReactNode
}

/**
 * Props for numbered list containers
 */
export interface NumberListProps {
	start?: number
	children: ReactNode
}

/**
 * Props for numbered list items
 */
export interface NumberItemProps {
	number: number
	children: ReactNode
}

function CheckListBase({ children }: ListProps): JSX.Element {
	return (
		<ul className="my-4 space-y-2" role="list">
			{children}
		</ul>
	)
}

export const CheckList = memo(CheckListBase)

function CheckItemBase({ checked = true, children }: CheckItemProps): JSX.Element {
	return (
		<li
			className="flex items-start gap-2"
			role="listitem"
			aria-label={checked ? "included" : "not included"}
		>
			<span aria-hidden="true">
				{checked ? (
					<IconCheck size={16} className="mt-0.5 text-emerald-400 shrink-0" />
				) : (
					<IconX size={16} className="mt-0.5 text-red-400 shrink-0" />
				)}
			</span>
			<span className="text-sm text-muted">{children}</span>
		</li>
	)
}

export const CheckItem = memo(CheckItemBase)

function BulletListBase({ children }: ListProps): JSX.Element {
	return (
		<ul className="my-4 space-y-2" role="list">
			{children}
		</ul>
	)
}

export const BulletList = memo(BulletListBase)

function BulletItemBase({ children }: BulletItemProps): JSX.Element {
	return (
		<li className="flex items-start gap-2" role="listitem">
			<span aria-hidden="true">
				<IconCircle size={6} className="mt-2 text-muted shrink-0" />
			</span>
			<span className="text-sm text-muted">{children}</span>
		</li>
	)
}

export const BulletItem = memo(BulletItemBase)

function NumberListBase({ start = 1, children }: NumberListProps): JSX.Element {
	return (
		<ol className="my-4 space-y-2 list-none" start={start} role="list">
			{children}
		</ol>
	)
}

export const NumberList = memo(NumberListBase)

function NumberItemBase({ number, children }: NumberItemProps): JSX.Element {
	return (
		<li className="flex items-start gap-3" role="listitem" value={number}>
			<span
				className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-surface border border-line text-xs font-medium text-muted"
				aria-hidden="true"
			>
				{number}
			</span>
			<span className="text-sm text-muted">{children}</span>
		</li>
	)
}

export const NumberItem = memo(NumberItemBase)
