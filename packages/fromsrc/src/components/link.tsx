"use client"

import NextLink from "next/link"
import { type ComponentPropsWithoutRef, type ReactNode, type JSX, memo } from "react"
import type { UrlObject } from "url"

type Href = string | UrlObject

export interface LinkProps extends Omit<ComponentPropsWithoutRef<"a">, "href"> {
	href: Href
	children: ReactNode
	external?: boolean
}

function LinkComponent({
	href,
	children,
	external,
	className,
	"aria-label": ariaLabel,
	...rest
}: LinkProps): JSX.Element {
	const hrefString = typeof href === "string" ? href : (href.href ?? "")
	const isExternal = external ?? hrefString.startsWith("http")

	const baseClass =
		"rounded-sm text-fg underline decoration-line underline-offset-4 hover:decoration-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
	const classes = className ? `${baseClass} ${className}` : baseClass

	if (isExternal) {
		const label = ariaLabel ?? `${typeof children === "string" ? children : ""} (opens in new tab)`
		return (
			<a
				href={hrefString}
				target="_blank"
				rel="noopener noreferrer"
				className={`inline-flex items-center gap-1 ${classes}`}
				aria-label={label.trim() || undefined}
				{...rest}
			>
				{children}
				<svg
					aria-hidden="true"
					viewBox="0 0 16 16"
					fill="currentColor"
					className="size-3 text-muted"
					role="img"
				>
					<path d="M3.75 2h3.5a.75.75 0 010 1.5h-2.69l5.72 5.72a.75.75 0 11-1.06 1.06L3.5 4.56v2.69a.75.75 0 01-1.5 0v-3.5A.75.75 0 012.75 3h1z" />
					<path d="M6.25 7.75a.75.75 0 000 1.5h5.69l-5.72 5.72a.75.75 0 101.06 1.06l5.72-5.72v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5z" />
				</svg>
			</a>
		)
	}

	return (
		<NextLink href={href} className={classes} aria-label={ariaLabel} {...rest}>
			{children}
		</NextLink>
	)
}

export const Link = memo(LinkComponent)
