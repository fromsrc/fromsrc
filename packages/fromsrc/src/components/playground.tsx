"use client"

import { type JSX, memo, useCallback, useState } from "react"

export interface PlaygroundProps {
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
	url: string
	headers?: Record<string, string>
	body?: string
	className?: string
}

interface Header { key: string; value: string }
interface Response { status: number; headers: Record<string, string>; body: string; time: number }

const colors: Record<string, string> = {
	GET: "bg-emerald-500/10 text-emerald-400",
	POST: "bg-blue-500/10 text-blue-400",
	PUT: "bg-amber-500/10 text-amber-400",
	PATCH: "bg-purple-500/10 text-purple-400",
	DELETE: "bg-red-500/10 text-red-400",
}

function toEntries(init?: Record<string, string>): Header[] {
	if (!init) return [{ key: "", value: "" }]
	const entries = Object.entries(init).map(([key, value]) => ({ key, value }))
	return entries.length ? entries : [{ key: "", value: "" }]
}

function PlaygroundBase({ method, url, headers: initial, body: initialBody, className = "" }: PlaygroundProps): JSX.Element {
	const [headers, setHeaders] = useState<Header[]>(() => toEntries(initial))
	const [body, setBody] = useState(initialBody ?? "")
	const [response, setResponse] = useState<Response | null>(null)
	const [loading, setLoading] = useState(false)
	const hasBody = method === "POST" || method === "PUT" || method === "PATCH"

	const updateHeader = useCallback((i: number, field: "key" | "value", val: string) => {
		setHeaders((h) => h.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)))
	}, [])

	const addHeader = useCallback(() => setHeaders((h) => [...h, { key: "", value: "" }]), [])
	const removeHeader = useCallback((i: number) => setHeaders((h) => h.filter((_, idx) => idx !== i)), [])

	const send = useCallback(async () => {
		setLoading(true)
		setResponse(null)
		const hdrs: Record<string, string> = {}
		for (const h of headers) if (h.key.trim()) hdrs[h.key.trim()] = h.value
		const start = performance.now()
		try {
			const res = await fetch(url, { method, headers: hdrs, body: hasBody && body ? body : undefined })
			const text = await res.text()
			const rh: Record<string, string> = {}
			res.headers.forEach((v, k) => { rh[k] = v })
			setResponse({ status: res.status, headers: rh, body: text, time: Math.round(performance.now() - start) })
		} catch {
			setResponse({ status: 0, headers: {}, body: "request failed", time: Math.round(performance.now() - start) })
		}
		setLoading(false)
	}, [method, url, headers, body, hasBody])

	const input = "w-full rounded border border-line bg-transparent px-2 py-1 text-sm"

	return (
		<div className={`rounded-lg border border-line overflow-hidden my-6 ${className}`.trim()}>
			<div className="flex items-center gap-3 px-4 py-3 bg-surface/50 border-b border-line">
				<span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${colors[method]}`}>{method}</span>
				<span className="font-mono text-sm text-fg">{url}</span>
			</div>
			<div className="p-4 space-y-4">
				<div>
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-medium text-muted uppercase">Headers</span>
						<button type="button" onClick={addHeader} className="text-xs text-accent">+ add</button>
					</div>
					{headers.map((h, i) => (
						<div key={i} className="flex gap-2 mb-1.5">
							<input className={input} placeholder="key" value={h.key} onChange={(e) => updateHeader(i, "key", e.target.value)} />
							<input className={input} placeholder="value" value={h.value} onChange={(e) => updateHeader(i, "value", e.target.value)} />
							<button type="button" onClick={() => removeHeader(i)} className="text-xs text-muted shrink-0">x</button>
						</div>
					))}
				</div>
				{hasBody && (
					<div>
						<span className="text-xs font-medium text-muted uppercase mb-2 block">Body</span>
						<textarea className={`${input} min-h-[80px] resize-y`} value={body} onChange={(e) => setBody(e.target.value)} />
					</div>
				)}
				<button type="button" onClick={send} disabled={loading} className="rounded bg-accent px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50">
					{loading ? "Sending..." : "Send"}
				</button>
			</div>
			{response && (
				<div className="border-t border-line p-4 space-y-3">
					<div className="flex items-center gap-3">
						<span className={`px-2 py-0.5 rounded text-xs font-bold ${response.status >= 200 && response.status < 300 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
							{response.status || "ERR"}
						</span>
						<span className="text-xs text-muted">{response.time}ms</span>
					</div>
					{Object.keys(response.headers).length > 0 && (
						<details className="text-xs">
							<summary className="text-muted cursor-pointer">Response Headers</summary>
							<pre className="font-mono text-xs whitespace-pre-wrap text-muted mt-1">
								{Object.entries(response.headers).map(([k, v]) => `${k}: ${v}`).join("\n")}
							</pre>
						</details>
					)}
					<pre className="font-mono text-xs whitespace-pre-wrap text-fg bg-surface/50 rounded p-3 overflow-x-auto">
						{response.body}
					</pre>
				</div>
			)}
		</div>
	)
}

export const Playground = memo(PlaygroundBase)
