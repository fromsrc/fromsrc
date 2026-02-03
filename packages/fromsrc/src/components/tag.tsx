"use client"

import { type HTMLAttributes, type ReactElement, type ReactNode, memo } from "react"

export type TagVariant = "default" | "primary" | "success" | "warning" | "danger"

/**
 * Props for the Tag component
 */
export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
	/**
	 * Visual style variant
	 */
	variant?: TagVariant
	/**
	 * Tag content
	 */
	children: ReactNode
}

const styles: Record<TagVariant, string> = {
	default: "bg-surface border-line text-muted",
	primary: "bg-accent/10 border-accent/20 text-accent",
	success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
	warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
	danger: "bg-red-500/10 border-red-500/20 text-red-400",
}

function TagBase({ variant = "default", className, children, ...props }: TagProps): ReactElement {
	return (
		<span
			role="listitem"
			className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${styles[variant]}${className ? ` ${className}` : ""}`}
			{...props}
		>
			{children}
		</span>
	)
}

export const Tag = memo(TagBase)

/**
 * Props for the Tags container component
 */
export interface TagsProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
	/**
	 * Tag elements to render
	 */
	children: ReactNode
}

function TagsBase({ className, children, ...props }: TagsProps): ReactElement {
	return (
		<div
			role="list"
			aria-label="Tags"
			className={`flex flex-wrap gap-1.5 my-4${className ? ` ${className}` : ""}`}
			{...props}
		>
			{children}
		</div>
	)
}

export const Tags = memo(TagsBase)
