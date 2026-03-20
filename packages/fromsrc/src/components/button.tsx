"use client";

import { forwardRef, memo } from "react";
import type { ComponentPropsWithoutRef, JSX } from "react";

import { Spinner } from "./spinner";

/** Visual style variant for the button */
export type ButtonVariant = "default" | "primary" | "ghost" | "danger";

/** Size variant for the button */
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Props for the Button component
 * @property variant - Visual style variant (default, primary, ghost, danger)
 * @property size - Button size (sm, md, lg)
 * @property loading - When true, shows a loading spinner and disables interaction
 */
export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  danger: "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20",
  default: "bg-surface text-fg border-line hover:bg-line hover:border-line",
  ghost: "bg-transparent text-fg border-transparent hover:bg-surface",
  primary:
    "bg-accent text-white border-accent hover:bg-accent/90 hover:border-accent/90",
};

const sizes: Record<ButtonSize, string> = {
  lg: "h-12 px-6 text-base gap-2.5",
  md: "h-10 px-4 text-sm gap-2",
  sm: "h-8 px-3 text-xs gap-1.5",
};

const spinnerSizes: Record<ButtonSize, "sm" | "md" | "lg"> = {
  lg: "md",
  md: "sm",
  sm: "sm",
};

const ButtonInner = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "default",
      size = "md",
      loading,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ): JSX.Element => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        aria-live={loading ? "polite" : undefined}
        className={`inline-flex items-center justify-center rounded-md border font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`.trim()}
        {...props}
      >
        {loading && (
          <Spinner
            size={spinnerSizes[size]}
            className="shrink-0"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

ButtonInner.displayName = "Button";

/** Accessible button component with variants, sizes, and loading state */
export const Button = memo(ButtonInner);
