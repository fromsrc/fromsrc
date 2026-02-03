"use client"

import { type JSX, type ReactNode, memo } from "react"
import { Tooltip } from "./tooltip"

/**
 * Props for the FormLabel component.
 * @property label - Text or element to display as the label
 * @property tooltip - Help text shown on hover via info icon
 * @property htmlFor - ID of the associated form element
 */
export interface FormLabelProps {
	label: ReactNode
	tooltip?: ReactNode
	htmlFor?: string
}

/**
 * Shared form label with optional tooltip info icon.
 * Consolidates the label+tooltip pattern used across form components.
 */
function FormLabelInner({ label, tooltip, htmlFor }: FormLabelProps): JSX.Element {
	return (
		<label htmlFor={htmlFor} className="flex items-center gap-1.5 text-sm font-medium text-fg">
			{label}
			{tooltip && (
				<Tooltip content={tooltip}>
					<svg
						aria-hidden="true"
						className="h-3.5 w-3.5 text-muted"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<circle cx="12" cy="12" r="10" strokeWidth={2} />
						<path strokeLinecap="round" strokeWidth={2} d="M12 16v-4m0-4h.01" />
					</svg>
				</Tooltip>
			)}
		</label>
	)
}

export const FormLabel = memo(FormLabelInner)
