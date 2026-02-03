"use client"

import type { ComponentProps, ReactNode } from "react"

type DefinitionListProps = ComponentProps<"dl">

export function DefinitionList({ className, ...props }: DefinitionListProps) {
	return <dl className={className ?? "my-6 space-y-4"} {...props} />
}

interface DefinitionProps extends ComponentProps<"div"> {
	term: ReactNode
}

export function Definition({ term, children, className, ...props }: DefinitionProps) {
	return (
		<div className={className ?? "border-b border-line pb-4 last:border-0 last:pb-0"} {...props}>
			<dt className="text-sm font-medium text-fg">{term}</dt>
			<dd className="mt-1 text-sm text-muted">{children}</dd>
		</div>
	)
}

type GlossaryProps = ComponentProps<"div">

export function Glossary({ className, children, ...props }: GlossaryProps) {
	return (
		<div className={className ?? "my-6 rounded-xl border border-line overflow-hidden"} {...props}>
			<dl className="divide-y divide-line">{children}</dl>
		</div>
	)
}

interface GlossaryItemProps extends ComponentProps<"div"> {
	term: ReactNode
}

export function GlossaryItem({ term, children, className, ...props }: GlossaryItemProps) {
	return (
		<div className={className ?? "p-4 flex flex-col gap-1"} {...props}>
			<dt className="text-sm font-medium text-fg">{term}</dt>
			<dd className="text-sm text-muted">{children}</dd>
		</div>
	)
}
