"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import { IconAlertCircle, IconCheckCircle, IconInfo, IconX, IconXCircle } from "./icons"

export interface Toast {
	id: string
	message: string
	type: "info" | "success" | "warning" | "error"
	duration?: number
}

interface ToastContextValue {
	toasts: Toast[]
	add: (toast: Omit<Toast, "id">) => void
	remove: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([])

	const add = useCallback((toast: Omit<Toast, "id">) => {
		const id = Math.random().toString(36).slice(2)
		setToasts((t) => [...t, { ...toast, id }])

		const duration = toast.duration ?? 3000
		setTimeout(() => {
			setToasts((t) => t.filter((x) => x.id !== id))
		}, duration)
	}, [])

	const remove = useCallback((id: string) => {
		setToasts((t) => t.filter((x) => x.id !== id))
	}, [])

	return (
		<ToastContext.Provider value={{ toasts, add, remove }}>
			{children}
			<ToastContainer />
		</ToastContext.Provider>
	)
}

export function useToast() {
	const ctx = useContext(ToastContext)
	if (!ctx) throw new Error("useToast must be used within ToastProvider")
	return ctx
}

const icons = {
	info: IconInfo,
	success: IconCheckCircle,
	warning: IconAlertCircle,
	error: IconXCircle,
}

const styles = {
	info: "border-blue-500/30 bg-blue-500/10",
	success: "border-green-500/30 bg-green-500/10",
	warning: "border-yellow-500/30 bg-yellow-500/10",
	error: "border-red-500/30 bg-red-500/10",
}

function ToastContainer() {
	const { toasts, remove } = useToast()

	if (toasts.length === 0) return null

	return (
		<div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
			{toasts.map((toast) => {
				const Icon = icons[toast.type]
				return (
					<div
						key={toast.id}
						className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${styles[toast.type]}`}
						role="alert"
					>
						<Icon size={20} className="shrink-0" />
						<span className="text-sm">{toast.message}</span>
						<button
							type="button"
							onClick={() => remove(toast.id)}
							className="ml-2 rounded p-1 hover:bg-white/10"
							aria-label="dismiss"
						>
							<IconX size={16} />
						</button>
					</div>
				)
			})}
		</div>
	)
}
