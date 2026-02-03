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
	info: "border-blue-500/30 bg-blue-500/10 text-blue-200",
	success: "border-green-500/30 bg-green-500/10 text-green-200",
	warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
	error: "border-red-500/30 bg-red-500/10 text-red-200",
}

export function Alert({ children, type = "info", title }: AlertProps) {
	const Icon = icons[type]

	return (
		<div className={`flex gap-3 rounded-lg border p-4 ${styles[type]}`} role="alert">
			<Icon className="size-5 shrink-0" aria-hidden />
			<div className="min-w-0">
				{title && <div className="mb-1 font-semibold">{title}</div>}
				<div className="text-sm opacity-90">{children}</div>
			</div>
		</div>
	)
}
