import type { ReactNode } from "react"

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

const methodColors: Record<Method, string> = {
	GET: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
	POST: "bg-blue-500/10 text-blue-400 border-blue-500/20",
	PUT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
	PATCH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
	DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
}

interface EndpointProps {
	method: Method
	path: string
	description?: string
	children?: ReactNode
}

export function Endpoint({ method, path, description, children }: EndpointProps) {
	return (
		<div className="my-6 rounded-lg border border-line overflow-hidden">
			<div className="flex items-center gap-3 px-4 py-3 bg-surface/50 border-b border-line">
				<span
					className={`px-2 py-0.5 text-xs font-mono font-medium rounded border ${methodColors[method]}`}
				>
					{method}
				</span>
				<code className="text-sm font-mono text-fg">{path}</code>
			</div>
			{description && (
				<div className="px-4 py-3 text-sm text-muted border-b border-line">
					{description}
				</div>
			)}
			{children && <div className="p-4">{children}</div>}
		</div>
	)
}

interface ParamProps {
	name: string
	type: string
	required?: boolean
	description?: string
	children?: ReactNode
}

export function Param({ name, type, required, description, children }: ParamProps) {
	return (
		<div className="py-3 border-b border-line last:border-0">
			<div className="flex items-center gap-2 mb-1">
				<code className="text-sm font-mono text-fg">{name}</code>
				<span className="text-xs text-muted">{type}</span>
				{required && (
					<span className="text-[10px] text-red-400 uppercase tracking-wider">required</span>
				)}
			</div>
			{description && <p className="text-sm text-muted">{description}</p>}
			{children}
		</div>
	)
}

interface ResponseProps {
	status: number
	description?: string
	children?: ReactNode
}

export function Response({ status, description, children }: ResponseProps) {
	const isSuccess = status >= 200 && status < 300
	const isError = status >= 400

	return (
		<div className="my-4">
			<div className="flex items-center gap-2 mb-2">
				<span
					className={`px-1.5 py-0.5 text-xs font-mono rounded ${
						isSuccess
							? "bg-emerald-500/10 text-emerald-400"
							: isError
								? "bg-red-500/10 text-red-400"
								: "bg-amber-500/10 text-amber-400"
					}`}
				>
					{status}
				</span>
				{description && <span className="text-sm text-muted">{description}</span>}
			</div>
			{children}
		</div>
	)
}
