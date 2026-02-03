"use client"

import { memo, useCallback, type JSX, type ReactNode } from "react"
import { useCopy } from "../hooks/copy"

/**
 * Props for the Anchor component
 */
export interface AnchorProps {
	/** Heading level (1-6) */
	level: 1 | 2 | 3 | 4 | 5 | 6
	/** Unique identifier for the anchor link */
	id: string
	/** Content to display inside the heading */
	children: ReactNode
	/** Optional additional CSS classes */
	className?: string
}

const sizes: Record<number, string> = {
	1: "text-3xl font-bold",
	2: "text-2xl font-semibold",
	3: "text-xl font-semibold",
	4: "text-lg font-medium",
	5: "text-base font-medium",
	6: "text-sm font-medium",
}

export const Anchor = memo(function Anchor({
	level,
	id,
	children,
	className,
}: AnchorProps): JSX.Element {
	const { copied, copy } = useCopy()
	const Tag = `h${level}` as const

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>): void => {
			e.preventDefault()
			const url = `${window.location.origin}${window.location.pathname}#${id}`
			copy(url)
			window.history.pushState(null, "", `#${id}`)
		},
		[id, copy]
	)

	return (
		<Tag id={id} className={`group relative scroll-mt-20 ${sizes[level]} ${className || ""}`}>
			<a
				href={`#${id}`}
				onClick={handleClick}
				className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
				aria-label="copy link"
			>
				{copied ? (
					<svg
						aria-hidden="true"
						viewBox="0 0 16 16"
						fill="currentColor"
						className="size-4 text-green-500"
					>
						<path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
					</svg>
				) : (
					<svg
						aria-hidden="true"
						viewBox="0 0 16 16"
						fill="currentColor"
						className="size-4 text-fg/40 hover:text-fg/60"
					>
						<path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z" />
					</svg>
				)}
			</a>
			{children}
		</Tag>
	)
})

export function H1(props: Omit<AnchorProps, "level">): JSX.Element {
	return <Anchor level={1} {...props} />
}

export function H2(props: Omit<AnchorProps, "level">): JSX.Element {
	return <Anchor level={2} {...props} />
}

export function H3(props: Omit<AnchorProps, "level">): JSX.Element {
	return <Anchor level={3} {...props} />
}

export function H4(props: Omit<AnchorProps, "level">): JSX.Element {
	return <Anchor level={4} {...props} />
}

export function H5(props: Omit<AnchorProps, "level">): JSX.Element {
	return <Anchor level={5} {...props} />
}

export function H6(props: Omit<AnchorProps, "level">): JSX.Element {
	return <Anchor level={6} {...props} />
}
