"use client"

import { type ComponentProps, type JSX, type ReactNode, memo } from "react"

/**
 * Props for the DefinitionList component
 */
export type DefinitionListProps = ComponentProps<"dl">

/**
 * A semantic definition list container using dl element
 */
export const DefinitionList = memo(function DefinitionList({
	className,
	...props
}: DefinitionListProps): JSX.Element {
	return <dl className={className ?? "my-6 space-y-4"} {...props} />
})

/**
 * Props for the Definition component
 */
export interface DefinitionProps extends ComponentProps<"div"> {
	/** The term being defined */
	term: ReactNode
}

/**
 * A single definition item with term and description
 */
export const Definition = memo(function Definition({
	term,
	children,
	className,
	...props
}: DefinitionProps): JSX.Element {
	return (
		<div className={className ?? "border-b border-line pb-4 last:border-0 last:pb-0"} {...props}>
			<dt className="text-sm font-medium text-fg">{term}</dt>
			<dd className="mt-1 text-sm text-muted">{children}</dd>
		</div>
	)
})

/**
 * Props for the Glossary component
 */
export type GlossaryProps = ComponentProps<"dl">

/**
 * A styled glossary container using semantic dl element
 */
export const Glossary = memo(function Glossary({
	className,
	...props
}: GlossaryProps): JSX.Element {
	return (
		<dl
			className={className ?? "my-6 rounded-xl border border-line overflow-hidden divide-y divide-line"}
			{...props}
		/>
	)
})

/**
 * Props for the GlossaryItem component
 */
export interface GlossaryItemProps extends ComponentProps<"div"> {
	/** The term being defined */
	term: ReactNode
}

/**
 * A single glossary item with term and description
 */
export const GlossaryItem = memo(function GlossaryItem({
	term,
	children,
	className,
	...props
}: GlossaryItemProps): JSX.Element {
	return (
		<div className={className ?? "p-4 flex flex-col gap-1"} {...props}>
			<dt className="text-sm font-medium text-fg">{term}</dt>
			<dd className="text-sm text-muted">{children}</dd>
		</div>
	)
})
