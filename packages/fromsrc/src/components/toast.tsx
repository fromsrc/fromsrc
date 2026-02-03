"use client"

import {
	type JSX,
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useRef,
	useState,
} from "react"
import { IconAlertCircle, IconCheckCircle, IconInfo, IconX, IconXCircle } from "./icons"

/**
 * Represents a single toast notification.
 */
export interface Toast {
	id: string
	message: string
	type: "info" | "success" | "warning" | "error"
	duration?: number
}

/**
 * Context value for managing toasts.
 */
interface ToastContextValue {
	toasts: Toast[]
	add: (toast: Omit<Toast, "id">) => void
	remove: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/**
 * Provider component for toast notifications.
 */
export function ToastProvider({ children }: { children: ReactNode }): JSX.Element {
	const [toasts, setToasts] = useState<Toast[]>([])
	const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

	const remove = useCallback((id: string) => {
		const timer = timers.current.get(id)
		if (timer) {
			clearTimeout(timer)
			timers.current.delete(id)
		}
		setToasts((t) => t.filter((x) => x.id !== id))
	}, [])

	const add = useCallback((toast: Omit<Toast, "id">) => {
		const id = Math.random().toString(36).slice(2)
		setToasts((t) => [...t, { ...toast, id }])

		const duration = toast.duration ?? 5000
		const timer = setTimeout(() => {
			timers.current.delete(id)
			setToasts((t) => t.filter((x) => x.id !== id))
		}, duration)
		timers.current.set(id, timer)
	}, [])

	return (
		<ToastContext.Provider value={{ toasts, add, remove }}>
			{children}
			<ToastContainer />
		</ToastContext.Provider>
	)
}

/**
 * Hook to access toast context.
 */
export function useToast(): ToastContextValue {
	const ctx = useContext(ToastContext)
	if (!ctx) throw new Error("useToast must be used within ToastProvider")
	return ctx
}

const icons: Record<Toast["type"], typeof IconInfo> = {
	info: IconInfo,
	success: IconCheckCircle,
	warning: IconAlertCircle,
	error: IconXCircle,
}

const styles: Record<Toast["type"], string> = {
	info: "border-blue-500/30 bg-blue-500/10",
	success: "border-green-500/30 bg-green-500/10",
	warning: "border-yellow-500/30 bg-yellow-500/10",
	error: "border-red-500/30 bg-red-500/10",
}

function ToastContainer(): JSX.Element | null {
	const { toasts, remove } = useToast()

	const handleDismiss = useCallback(
		(id: string) => (): void => {
			remove(id)
		},
		[remove]
	)

	if (toasts.length === 0) return null

	return (
		<div
			role="region"
			aria-label="notifications"
			aria-live="polite"
			aria-atomic="false"
			aria-relevant="additions removals"
			className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
		>
			{toasts.map((toast) => {
				const Icon = icons[toast.type]
				return (
					<div
						key={toast.id}
						className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${styles[toast.type]}`}
						role="alert"
						aria-live={toast.type === "error" ? "assertive" : "polite"}
						aria-atomic="true"
					>
						<Icon size={20} className="shrink-0" aria-hidden="true" />
						<span className="text-sm">{toast.message}</span>
						<button
							type="button"
							onClick={handleDismiss(toast.id)}
							className="ml-2 rounded p-1 hover:bg-white/10"
							aria-label="dismiss notification"
						>
							<IconX size={16} aria-hidden="true" />
						</button>
					</div>
				)
			})}
		</div>
	)
}
