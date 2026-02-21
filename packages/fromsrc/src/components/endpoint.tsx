import { type ReactNode, type JSX, memo } from "react"

/**
 * HTTP methods supported by the endpoint component
 */
export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | "TRACE"

const methodColors: Record<Method, string> = {
	GET: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
	POST: "bg-blue-500/10 text-blue-400 border-blue-500/20",
	PUT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
	PATCH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
	DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
	HEAD: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
	OPTIONS: "bg-violet-500/10 text-violet-400 border-violet-500/20",
	TRACE: "bg-pink-500/10 text-pink-400 border-pink-500/20",
}

/**
 * Props for the Endpoint component
 */
export interface EndpointProps {
	/** HTTP method for the endpoint */
	method: Method
	/** URL path for the endpoint */
	path: string
	/** Description of what the endpoint does */
	description?: string
	/** Child content such as parameters and responses */
	children?: ReactNode
}

function EndpointBase({ method, path, description, children }: EndpointProps): JSX.Element {
	return (
		<article
			className="my-6 rounded-lg border border-line overflow-hidden"
			aria-labelledby={`endpoint-${method}-${path.replace(/\//g, "-")}`}
		>
			<header className="flex items-center gap-3 px-4 py-3 bg-surface/50 border-b border-line">
				<span
					className={`px-2 py-0.5 text-xs font-mono font-medium rounded border ${methodColors[method]}`}
					role="text"
					aria-label={`${method} method`}
				>
					{method}
				</span>
				<code
					id={`endpoint-${method}-${path.replace(/\//g, "-")}`}
					className="text-sm font-mono text-fg"
				>
					{path}
				</code>
			</header>
			{description && (
				<p className="px-4 py-3 text-sm text-muted border-b border-line">{description}</p>
			)}
			{children && (
				<section className="p-4" aria-label="Endpoint details">
					{children}
				</section>
			)}
		</article>
	)
}

export const Endpoint = memo(EndpointBase)

/**
 * Props for the Param component
 */
export interface ParamProps {
	/** Parameter name */
	name: string
	/** Parameter type */
	type: string
	/** Whether the parameter is required */
	required?: boolean
	/** Description of the parameter */
	description?: string
	/** Additional content */
	children?: ReactNode
}

function ParamBase({ name, type, required, description, children }: ParamProps): JSX.Element {
	const paramId = `param-${name}`
	return (
		<div
			className="py-3 border-b border-line last:border-0"
			role="listitem"
			aria-labelledby={paramId}
		>
			<div className="flex items-center gap-2 mb-1">
				<code id={paramId} className="text-sm font-mono text-fg">
					{name}
				</code>
				<span className="text-xs text-muted" aria-label={`type ${type}`}>
					{type}
				</span>
				{required && (
					<span
						className="text-[10px] text-red-400 uppercase tracking-wider"
						role="status"
						aria-label="required parameter"
					>
						required
					</span>
				)}
			</div>
			{description && (
				<p className="text-sm text-muted" id={`${paramId}-desc`}>
					{description}
				</p>
			)}
			{children}
		</div>
	)
}

export const Param = memo(ParamBase)

/**
 * Valid HTTP status codes
 */
type HttpStatus =
	| 100
	| 101
	| 102
	| 103
	| 200
	| 201
	| 202
	| 203
	| 204
	| 205
	| 206
	| 207
	| 208
	| 226
	| 300
	| 301
	| 302
	| 303
	| 304
	| 305
	| 307
	| 308
	| 400
	| 401
	| 402
	| 403
	| 404
	| 405
	| 406
	| 407
	| 408
	| 409
	| 410
	| 411
	| 412
	| 413
	| 414
	| 415
	| 416
	| 417
	| 418
	| 421
	| 422
	| 423
	| 424
	| 425
	| 426
	| 428
	| 429
	| 431
	| 451
	| 500
	| 501
	| 502
	| 503
	| 504
	| 505
	| 506
	| 507
	| 508
	| 510
	| 511

/**
 * Props for the Response component
 */
export interface ResponseProps {
	/** HTTP status code */
	status: HttpStatus | string
	/** Description of the response */
	description?: string
	/** Response body content */
	children?: ReactNode
}

function ResponseBase({ status, description, children }: ResponseProps): JSX.Element {
	const number = typeof status === "string" ? Number(status) : status
	const isSuccess = Number.isFinite(number) && number >= 200 && number < 300
	const isError = Number.isFinite(number) && number >= 400
	const statusLabel = isSuccess ? "success" : isError ? "error" : "redirect"

	return (
		<section className="my-4" aria-labelledby={`response-${status}`}>
			<div className="flex items-center gap-2 mb-2">
				<span
					id={`response-${status}`}
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

export const Response = memo(ResponseBase)
