"use client"

import {
	type ComponentPropsWithoutRef,
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react"

export type TextareaVariant = "default" | "error"
export type TextareaSize = "sm" | "md" | "lg"

/**
 * @param variant - visual style variant
 * @param size - textarea size
 * @param label - accessible label
 * @param error - error message
 * @param hint - helper text
 * @param autoresize - auto-resize based on content
 * @param maxLength - maximum character count
 * @param showCount - show character count
 * @example <Textarea label="Message" placeholder="Type here..." />
 */
export interface TextareaProps extends Omit<ComponentPropsWithoutRef<"textarea">, "size"> {
	variant?: TextareaVariant
	size?: TextareaSize
	label?: ReactNode
	error?: ReactNode
	hint?: ReactNode
	autoresize?: boolean
	showCount?: boolean
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

export function Textarea({
	variant = "default",
	size = "md",
	label,
	error,
	hint,
	autoresize = false,
	showCount = false,
	maxLength,
	className = "",
	id,
	value,
	defaultValue,
	onChange,
	...props
}: TextareaProps) {
	const generatedId = useId()
	const textareaId = id || generatedId
	const errorId = error ? `${textareaId}-error` : undefined
	const hintId = hint && !error ? `${textareaId}-hint` : undefined
	const countId = showCount ? `${textareaId}-count` : undefined
	const describedBy = [errorId, hintId, countId].filter(Boolean).join(" ") || undefined

	const actualVariant = error ? "error" : variant

	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const [charCount, setCharCount] = useState(() => {
		const initial = value ?? defaultValue ?? ""
		return typeof initial === "string" ? initial.length : 0
	})

	const resize = useCallback(() => {
		const textarea = textareaRef.current
		if (!textarea || !autoresize) return
		textarea.style.height = "auto"
		textarea.style.height = `${textarea.scrollHeight}px`
	}, [autoresize])

	useEffect(() => {
		resize()
	}, [resize, value])

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setCharCount(e.target.value.length)
		if (autoresize) resize()
		onChange?.(e)
	}

	return (
		<div className="flex flex-col gap-1.5">
			{label && (
				<label htmlFor={textareaId} className="text-sm font-medium text-fg">
					{label}
				</label>
			)}
			<textarea
				ref={textareaRef}
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
					{error && (
						<span id={errorId} className="text-xs text-red-400" role="alert">
							{error}
						</span>
					)}
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
}
