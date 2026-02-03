"use client"

import type React from "react"
import { type ReactNode, memo } from "react"
import { IconAlertCircle, IconCheckCircle, IconInfo, IconXCircle } from "./icons"

/**
 * props for the alert component
 * @property children - alert content
 * @property type - visual style variant
 * @property title - optional heading
 * @example <Alert type="warning">check your input</Alert>
 */
export interface AlertProps {
	children: ReactNode
	type?: "info" | "success" | "warning" | "error"
	title?: string
}

const icons = {
	info: IconInfo,
	success: IconCheckCircle,
	warning: IconAlertCircle,
	error: IconXCircle,
}

const styles = {
	info: "border-line bg-surface text-muted [&_svg]:text-accent",
	success: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300 [&_svg]:text-emerald-400",
	warning: "border-amber-500/20 bg-amber-500/5 text-amber-300 [&_svg]:text-amber-400",
	error: "border-red-500/20 bg-red-500/5 text-red-300 [&_svg]:text-red-400",
}

function AlertBase({ children, type = "info", title }: AlertProps): React.ReactElement {
	const Icon = icons[type]

	return (
		<div className={`flex gap-3 rounded-lg border p-4 ${styles[type]}`} role="alert">
			<Icon size={20} className="shrink-0 mt-0.5" aria-hidden="true" />
			<div className="min-w-0">
				{title && <div className="mb-1 font-medium text-fg">{title}</div>}
				<div className="text-sm">{children}</div>
			</div>
		</div>
	)
}

export const Alert = memo(AlertBase)
