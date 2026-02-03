"use client"

import type { ReactNode } from "react"

interface DefinitionListProps {
	children: ReactNode
}

export function DefinitionList({ children }: DefinitionListProps) {
	return <dl className="my-6 space-y-4">{children}</dl>
}

interface DefinitionProps {
	term: string
	children: ReactNode
}

export function Definition({ term, children }: DefinitionProps) {
	return (
		<div className="border-b border-line pb-4 last:border-0 last:pb-0">
			<dt className="text-sm font-medium text-fg">{term}</dt>
			<dd className="mt-1 text-sm text-muted">{children}</dd>
		</div>
	)
}

interface GlossaryProps {
	children: ReactNode
}

export function Glossary({ children }: GlossaryProps) {
	return (
		<div className="my-6 rounded-xl border border-line overflow-hidden">
			<dl className="divide-y divide-line">{children}</dl>
		</div>
	)
}

interface GlossaryItemProps {
	term: string
	children: ReactNode
}

export function GlossaryItem({ term, children }: GlossaryItemProps) {
	return (
		<div className="p-4 flex flex-col gap-1">
			<dt className="text-sm font-medium text-fg">{term}</dt>
			<dd className="text-sm text-muted">{children}</dd>
		</div>
	)
}
