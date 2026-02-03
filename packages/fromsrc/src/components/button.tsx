"use client"

import { type ComponentPropsWithoutRef, forwardRef } from "react"
import { Spinner } from "./spinner"

export type ButtonVariant = "default" | "primary" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

/**
 * @param variant - visual style variant
 * @param size - button size
 * @param loading - show loading spinner
 * @example <Button variant="primary" size="md">Submit</Button>
 */
export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
	variant?: ButtonVariant
	size?: ButtonSize
	loading?: boolean
}

const variants: Record<ButtonVariant, string> = {
	default: "bg-surface text-fg border-line hover:bg-line hover:border-line",
	primary: "bg-accent text-white border-accent hover:bg-accent/90 hover:border-accent/90",
	ghost: "bg-transparent text-fg border-transparent hover:bg-surface",
	danger: "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20",
}

const sizes: Record<ButtonSize, string> = {
	sm: "h-8 px-3 text-xs gap-1.5",
	md: "h-10 px-4 text-sm gap-2",
	lg: "h-12 px-6 text-base gap-2.5",
}

const spinnerSizes: Record<ButtonSize, "sm" | "md" | "lg"> = {
	sm: "sm",
	md: "sm",
	lg: "md",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ variant = "default", size = "md", loading, disabled, children, className = "", ...props },
		ref,
	) => {
		const isDisabled = disabled || loading

		return (
			<button
				ref={ref}
				disabled={isDisabled}
				aria-disabled={isDisabled || undefined}
				aria-busy={loading || undefined}
				className={`inline-flex items-center justify-center rounded-md border font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`.trim()}
				{...props}
			>
				{loading && <Spinner size={spinnerSizes[size]} className="shrink-0" />}
				{children}
			</button>
		)
	},
)

Button.displayName = "Button"
