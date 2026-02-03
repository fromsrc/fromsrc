"use client"

import { type ReactNode, forwardRef, memo, useCallback, useEffect, useId, useRef, useState } from "react"
import { ErrorMessage } from "./errormessage"
import { FormLabel } from "./formlabel"

export type TextareaVariant = "default" | "error"
export type TextareaSize = "sm" | "md" | "lg"

/**
 * Props for the Textarea component.
 * @property variant - visual style variant
 * @property size - textarea size
 * @property label - accessible label
 * @property error - error message
 * @property hint - helper text
 * @property autoresize - auto-resize based on content
 * @property maxLength - maximum character count
 * @property showCount - show character count
 * @property tooltip - help text shown on hover
 */
export interface TextareaProps extends Omit<React.ComponentPropsWithRef<"textarea">, "size"> {
	variant?: TextareaVariant
	size?: TextareaSize
	label?: ReactNode
	error?: ReactNode
	hint?: ReactNode
	autoresize?: boolean
	showCount?: boolean
	tooltip?: ReactNode
}

const variants: Record<TextareaVariant, string> = {
	default: "border-line bg-surface text-fg placeholder:text-muted focus:border-accent",
	error: "border-red-500/50 bg-red-500/5 text-fg placeholder:text-muted focus:border-red-500",
}

const sizes: Record<TextareaSize, string> = {
	sm: "px-2.5 py-1.5 text-xs min-h-[60px]",
	md: "px-3 py-2 text-sm min-h-[80px]",
	lg: "px-4 py-3 text-base min-h-[100px]",
}

export const Textarea = memo(forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
	{
		variant = "default",
		size = "md",
		label,
		error,
		hint,
		autoresize = false,
		showCount = false,
		tooltip,
		maxLength,
		className = "",
		id,
		value,
		defaultValue,
		onChange,
		...props
	},
	ref,
): React.ReactElement {
	const generatedId = useId()
	const textareaId = id || generatedId
	const errorId = error ? `${textareaId}-error` : undefined
	const hintId = hint && !error ? `${textareaId}-hint` : undefined
	const countId = showCount ? `${textareaId}-count` : undefined
	const describedBy = [errorId, hintId, countId].filter(Boolean).join(" ") || undefined

	const actualVariant = error ? "error" : variant

	const internalRef = useRef<HTMLTextAreaElement>(null)
	const [charCount, setCharCount] = useState(() => {
		const initial = value ?? defaultValue ?? ""
		return typeof initial === "string" ? initial.length : 0
	})

	const resize = useCallback(() => {
		const textarea = internalRef.current
		if (!textarea || !autoresize) return
		textarea.style.height = "auto"
		textarea.style.height = `${textarea.scrollHeight}px`
	}, [autoresize])

	useEffect(() => {
		resize()
	}, [resize, value])

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
		setCharCount(e.target.value.length)
		if (autoresize) resize()
		onChange?.(e)
	}

	const setRefs = useCallback(
		(node: HTMLTextAreaElement | null): void => {
			internalRef.current = node
			if (typeof ref === "function") {
				ref(node)
			} else if (ref) {
				ref.current = node
			}
		},
		[ref],
	)

	return (
		<div className="flex flex-col gap-1.5">
			{label && <FormLabel label={label} tooltip={tooltip} htmlFor={textareaId} />}
			<textarea
				ref={setRefs}
				id={textareaId}
				aria-invalid={actualVariant === "error" ? true : undefined}
				aria-describedby={describedBy}
				maxLength={maxLength}
				value={value}
				defaultValue={defaultValue}
				onChange={handleChange}
				className={`rounded-md border outline-none transition-colors resize-vertical ${variants[actualVariant]} ${sizes[size]} ${autoresize ? "resize-none overflow-hidden" : ""} ${className}`.trim()}
				{...props}
			/>
			<div className="flex justify-between gap-2">
				<div className="flex-1">
					{error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}
					{hint && !error && (
						<span id={hintId} className="text-xs text-muted">
							{hint}
						</span>
					)}
				</div>
				{showCount && (
					<span id={countId} className="text-xs text-muted" aria-live="polite">
						{charCount}
						{maxLength ? `/${maxLength}` : ""}
					</span>
				)}
			</div>
		</div>
	)
}))
