import { type JSX, memo, useMemo } from "react"
import { parseOpenApi, type OpenApiEndpoint, type OpenApiSpec } from "../openapi"
import { Endpoint, Param, Response } from "./endpoint"
import { Openapischema } from "./openapischema"
import { OpenapiTags } from "./openapitags"

export interface OpenapiProps {
	spec: string | object
	tag?: string
	method?: string
	path?: string
	group?: "none" | "tag"
}

function bypath(endpoint: OpenApiEndpoint, path: string): boolean {
	return endpoint.path.toLowerCase().includes(path.toLowerCase())
}

function bymethod(endpoint: OpenApiEndpoint, method: string): boolean {
	return endpoint.method.toLowerCase() === method.toLowerCase()
}

function bytag(endpoint: OpenApiEndpoint, tag: string): boolean {
	return endpoint.tags.some((entry) => entry.toLowerCase() === tag.toLowerCase())
}

function parsedspec(spec: string | object): OpenApiSpec | null {
	try {
		return parseOpenApi(spec)
	} catch {
		return null
	}
}

function methodrank(method: string): number {
	const list = ["get", "post", "put", "patch", "delete", "options", "head", "trace"]
	const index = list.indexOf(method.toLowerCase())
	return index === -1 ? list.length : index
}

function sorted(endpoints: OpenApiEndpoint[]): OpenApiEndpoint[] {
	return [...endpoints].sort((left, right) => {
		if (left.path === right.path) return methodrank(left.method) - methodrank(right.method)
		return left.path.localeCompare(right.path)
	})
}

function formatseclabel(list: string[] | undefined): string | null {
	if (!list || list.length === 0) return null
	return list.join(", ")
}

function tagname(endpoint: OpenApiEndpoint): string {
	const first = endpoint.tags[0]
	if (!first) return "untagged"
	return first
}

function tagid(name: string): string {
	return `tag-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
}

function groups(endpoints: OpenApiEndpoint[]): Array<[string, OpenApiEndpoint[]]> {
	const map = new Map<string, OpenApiEndpoint[]>()
	for (const endpoint of endpoints) {
		const name = tagname(endpoint)
		const list = map.get(name)
		if (list) list.push(endpoint)
		else map.set(name, [endpoint])
	}
	return Array.from(map.entries()).sort((left, right) => {
		if (left[0] === "untagged") return 1
		if (right[0] === "untagged") return -1
		return left[0].localeCompare(right[0])
	})
}

function endpointmeta(endpoint: OpenApiEndpoint): JSX.Element {
	const security = formatseclabel(endpoint.security)
	return (
		<div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
			{endpoint.operationId && (
				<span className="rounded border border-line px-2 py-1 font-mono text-dim">{endpoint.operationId}</span>
			)}
			{endpoint.deprecated && (
				<span className="rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-red-400">deprecated</span>
			)}
			{endpoint.tags.map((entry) => (
				<span key={`${endpoint.path}-${endpoint.method}-tag-${entry}`} className="rounded border border-line px-2 py-1 text-muted">
					{entry}
				</span>
			))}
			{security && <span className="rounded border border-line px-2 py-1 text-muted">security: {security}</span>}
		</div>
	)
}

function endpointview(endpoint: OpenApiEndpoint): JSX.Element {
	return (
		<Endpoint
			key={`${endpoint.method}-${endpoint.path}`}
			method={endpoint.method}
			path={endpoint.path}
			description={endpoint.summary ?? endpoint.description}
		>
			{endpointmeta(endpoint)}
			{endpoint.parameters.length > 0 && (
				<div className="mb-4" role="list" aria-label="parameters">
					{endpoint.parameters.map((parameter) => (
						<Param
							key={`${endpoint.path}-${endpoint.method}-${parameter.in}-${parameter.name}`}
							name={`${parameter.name} (${parameter.in})`}
							type={parameter.schema?.type ?? "string"}
							required={parameter.required}
							description={parameter.description}
						/>
					))}
				</div>
			)}
			{endpoint.requestBody?.content && (
				<div className="mb-4">
					<h4 className="text-sm font-medium text-fg mb-2">request body</h4>
					<div className="space-y-3">
						{Object.entries(endpoint.requestBody.content).map(([media, content]) => (
							<div key={media} className="rounded border border-line p-3">
								<p className="text-xs font-mono text-dim mb-2">{media}</p>
								<Openapischema schema={content.schema} />
							</div>
						))}
					</div>
				</div>
			)}
			{endpoint.responses.map((response) => (
				<Response key={`${endpoint.path}-${endpoint.method}-${response.status}`} status={response.status} description={response.description}>
					{response.content && (
						<div className="space-y-3 mt-2">
							{Object.entries(response.content).map(([media, content]) => (
								<div key={media} className="rounded border border-line p-3">
									<p className="text-xs font-mono text-dim mb-2">{media}</p>
									<Openapischema schema={content.schema} />
								</div>
							))}
						</div>
					)}
				</Response>
			))}
		</Endpoint>
	)
}

function OpenapiBase({ spec, tag, method, path, group = "none" }: OpenapiProps): JSX.Element {
	const parsed = useMemo(() => parsedspec(spec), [spec])

	const endpoints = useMemo(() => {
		if (!parsed) return []
		let list = parsed.endpoints
		if (tag) list = list.filter((entry) => bytag(entry, tag))
		if (method) list = list.filter((entry) => bymethod(entry, method))
		if (path) list = list.filter((entry) => bypath(entry, path))
		return sorted(list)
	}, [parsed, tag, method, path])

	if (!parsed) return <p className="text-sm text-red-400">invalid openapi specification</p>
	if (endpoints.length === 0) return <p className="text-sm text-muted">no endpoints found</p>
	const list = groups(endpoints)
	const items = list.map(([name, value]) => ({ name, id: tagid(name), count: value.length }))

	return (
		<section className="my-6" aria-label="openapi reference">
			<header className="mb-4">
				<h2 className="text-lg font-medium text-fg">{parsed.info.title}</h2>
				<p className="text-xs text-dim">v{parsed.info.version}</p>
				{parsed.info.description && <p className="mt-2 text-sm text-muted">{parsed.info.description}</p>}
			</header>
			{group === "tag" ? (
				<div className="space-y-8">
					<OpenapiTags items={items} />
					{list.map(([name, list]) => (
						<section key={name} aria-labelledby={tagid(name)}>
							<h3 id={tagid(name)} className="mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-dim">
								<span>{name}</span>
								<span className="rounded border border-line px-1.5 py-0.5 text-[10px] font-mono normal-case">{list.length}</span>
							</h3>
							<div>{list.map(endpointview)}</div>
						</section>
					))}
				</div>
			) : (
				<div>{endpoints.map(endpointview)}</div>
			)}
		</section>
	)
}

export const Openapi = memo(OpenapiBase)
