import type { ReactNode } from "react"

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

const methodColors: Record<Method, string> = {
	GET: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
	POST: "bg-blue-500/10 text-blue-400 border-blue-500/20",
	PUT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
	PATCH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
	DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
}

export interface EndpointProps {
	method: Method
	path: string
	description?: string
	children?: ReactNode
}

export function Endpoint({ method, path, description, children }: EndpointProps) {
	return (
		<article
			className="my-6 rounded-lg border border-line overflow-hidden"
			aria-label={`${method} ${path}`}
		>
			<header className="flex items-center gap-3 px-4 py-3 bg-surface/50 border-b border-line">
				<span
					className={`px-2 py-0.5 text-xs font-mono font-medium rounded border ${methodColors[method]}`}
				>
					{method}
				</span>
				<code className="text-sm font-mono text-fg">{path}</code>
			</header>
			{description && (
				<p className="px-4 py-3 text-sm text-muted border-b border-line">{description}</p>
			)}
			{children && <section className="p-4">{children}</section>}
		</article>
	)
}

export interface ParamProps {
	name: string
	type: string
	required?: boolean
	description?: string
	children?: ReactNode
}

export function Param({ name, type, required, description, children }: ParamProps) {
	return (
		<div className="py-3 border-b border-line last:border-0" role="listitem">
			<div className="flex items-center gap-2 mb-1">
				<code className="text-sm font-mono text-fg">{name}</code>
				<span className="text-xs text-muted">{type}</span>
				{required && (
					<span className="text-[10px] text-red-400 uppercase tracking-wider" aria-label="required">
						required
					</span>
				)}
			</div>
			{description && <p className="text-sm text-muted">{description}</p>}
			{children}
		</div>
	)
}

type HttpStatus = 100 | 101 | 102 | 103 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226 |
	300 | 301 | 302 | 303 | 304 | 305 | 307 | 308 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 |
	408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 | 422 | 423 | 424 | 425 |
	426 | 428 | 429 | 431 | 451 | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511

export interface ResponseProps {
	status: HttpStatus
	description?: string
	children?: ReactNode
}

export function Response({ status, description, children }: ResponseProps) {
	const isSuccess = status >= 200 && status < 300
	const isError = status >= 400
	const statusLabel = isSuccess ? "success" : isError ? "error" : "redirect"

	return (
		<section className="my-4" aria-label={`Response ${status}`}>
			<div className="flex items-center gap-2 mb-2">
				<span
					className={`px-1.5 py-0.5 text-xs font-mono rounded ${
						isSuccess
							? "bg-emerald-500/10 text-emerald-400"
							: isError
								? "bg-red-500/10 text-red-400"
								: "bg-amber-500/10 text-amber-400"
					}`}
					role="status"
					aria-label={`HTTP ${status} ${statusLabel}`}
				>
					{status}
				</span>
				{description && <span className="text-sm text-muted">{description}</span>}
			</div>
			{children}
		</section>
	)
}
