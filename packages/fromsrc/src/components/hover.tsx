"use client"

import { memo, useCallback, useId, useState } from "react"

/**
 * Props for displaying inline hover information with colored text
 */
export interface HoverInfoProps {
	children: React.ReactNode
	info: string
	type?: "type" | "value" | "error"
}

/**
 * Props for displaying a popup with custom trigger and content
 */
export interface TypePopupProps {
	trigger: React.ReactNode
	content: React.ReactNode
}

const colors: Record<NonNullable<HoverInfoProps["type"]>, string> = {
	type: "text-cyan-400",
	value: "text-green-400",
	error: "text-red-400",
}

function HoverInfoBase({ children, info, type = "type" }: HoverInfoProps): React.ReactElement {
	const [show, setShow] = useState(false)
	const id = useId()

	const handleShow = useCallback((): void => setShow(true), [])
	const handleHide = useCallback((): void => setShow(false), [])

	return (
		<span
			className="relative inline cursor-help border-b border-dotted border-current"
			onMouseEnter={handleShow}
			onMouseLeave={handleHide}
			onFocus={handleShow}
			onBlur={handleHide}
			tabIndex={0}
			aria-describedby={show ? id : undefined}
		>
			{children}
			{show && (
				<span
					id={id}
					role="tooltip"
					className="absolute left-0 top-full z-50 mt-1 whitespace-nowrap rounded border border-line bg-surface px-2 py-1 font-mono text-xs shadow-lg"
				>
					<span className={colors[type]}>{info}</span>
				</span>
			)}
		</span>
	)
}

function TypePopupBase({ trigger, content }: TypePopupProps): React.ReactElement {
	const [show, setShow] = useState(false)
	const id = useId()

	const handleShow = useCallback((): void => setShow(true), [])
	const handleHide = useCallback((): void => setShow(false), [])

	return (
		<span
			className="relative inline"
			onMouseEnter={handleShow}
			onMouseLeave={handleHide}
			onFocus={handleShow}
			onBlur={handleHide}
		>
			<span
				className="cursor-help border-b border-dotted border-current"
				tabIndex={0}
				aria-describedby={show ? id : undefined}
			>
				{trigger}
			</span>
			{show && (
				<span
					id={id}
					role="tooltip"
					className="absolute left-0 top-full z-50 mt-1 max-w-md rounded border border-line bg-surface p-2 font-mono text-xs shadow-lg"
				>
					{content}
				</span>
			)}
		</span>
	)
}

export const HoverInfo = memo(HoverInfoBase)
export const TypePopup = memo(TypePopupBase)
