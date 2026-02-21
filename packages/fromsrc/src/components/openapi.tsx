import { type JSX, memo, useMemo } from "react"
import { parseOpenApi, type OpenApiEndpoint, type OpenApiSpec } from "../openapi"
import { Endpoint, Param, Response } from "./endpoint"
import { Openapischema } from "./openapischema"

export interface OpenapiProps {
	spec: string | object
	tag?: string
	method?: string
	path?: string
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

function sorted(endpoints: OpenApiEndpoint[]): OpenApiEndpoint[] {
	return [...endpoints].sort((left, right) => {
		if (left.path === right.path) return left.method.localeCompare(right.method)
		return left.path.localeCompare(right.path)
	})
}

function OpenapiBase({ spec, tag, method, path }: OpenapiProps): JSX.Element {
	const parsed = useMemo(() => parsedspec(spec), [spec])

	const endpoints = useMemo(() => {
		if (!parsed) return []
		let list = parsed.endpoints
		if (tag) list = list.filter((entry) => bytag(entry, tag))
		if (method) list = list.filter((entry) => bymethod(entry, method))
		if (path) list = list.filter((entry) => bypath(entry, path))
		return sorted(list)
	}, [parsed, tag, method, path])

	if (!parsed) {
		return <p className="text-sm text-red-400">invalid openapi specification</p>
	}

	if (endpoints.length === 0) {
		return <p className="text-sm text-muted">no endpoints found</p>
	}

	return (
		<section className="my-6" aria-label="openapi reference">
			<header className="mb-4">
				<h2 className="text-lg font-medium text-fg">{parsed.info.title}</h2>
				<p className="text-xs text-dim">v{parsed.info.version}</p>
				{parsed.info.description && <p className="text-sm text-muted mt-2">{parsed.info.description}</p>}
			</header>
			<div>
				{endpoints.map((endpoint) => (
					<Endpoint
						key={`${endpoint.method}-${endpoint.path}`}
						method={endpoint.method}
						path={endpoint.path}
						description={endpoint.summary ?? endpoint.description}
					>
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
							<Response
								key={`${endpoint.path}-${endpoint.method}-${response.status}`}
								status={response.status}
								description={response.description}
							>
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
				))}
			</div>
		</section>
	)
}

export const Openapi = memo(OpenapiBase)
