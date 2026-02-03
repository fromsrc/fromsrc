"use client"

import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"
import type { ReactNode } from "react"

export interface AlertProps {
	children: ReactNode
	type?: "info" | "success" | "warning" | "error"
	title?: string
}

const icons = {
	info: Info,
	success: CheckCircle,
	warning: AlertCircle,
	error: XCircle,
}

const styles = {
	info: "border-line bg-surface text-muted [&_svg]:text-accent",
	success: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300 [&_svg]:text-emerald-400",
	warning: "border-amber-500/20 bg-amber-500/5 text-amber-300 [&_svg]:text-amber-400",
	error: "border-red-500/20 bg-red-500/5 text-red-300 [&_svg]:text-red-400",
}

export function Alert({ children, type = "info", title }: AlertProps) {
	const Icon = icons[type]

	return (
		<div className={`flex gap-3 rounded-lg border p-4 ${styles[type]}`} role="alert">
			<Icon className="size-5 shrink-0 mt-0.5" aria-hidden />
			<div className="min-w-0">
				{title && <div className="mb-1 font-medium text-fg">{title}</div>}
				<div className="text-sm">{children}</div>
			</div>
		</div>
	)
}
