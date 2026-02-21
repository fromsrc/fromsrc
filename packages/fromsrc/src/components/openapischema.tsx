import { type JSX, memo } from "react"
import type { OpenApiSchema } from "../openapi"

function scalar(value: unknown): string {
	if (typeof value === "string") return value
	if (typeof value === "number" || typeof value === "boolean") return String(value)
	return JSON.stringify(value)
}

function typestring(schema: OpenApiSchema | undefined): string {
	if (!schema) return "unknown"
	if (schema.enum?.length) return schema.enum.join(" | ")
	if (schema.type === "array") return `${typestring(schema.items)}[]`
	if (schema.oneOf?.length) return schema.oneOf.map((part) => typestring(part)).join(" | ")
	if (schema.anyOf?.length) return schema.anyOf.map((part) => typestring(part)).join(" | ")
	if (schema.allOf?.length) return schema.allOf.map((part) => typestring(part)).join(" & ")
	return schema.type ?? "object"
}

export interface OpenapischemaProps {
	schema?: OpenApiSchema
	name?: string
	required?: boolean
}

function OpenapischemaBase({ schema, name, required }: OpenapischemaProps): JSX.Element {
	if (!schema) {
		return <code className="text-xs font-mono text-muted">unknown</code>
	}

	const properties = schema.properties ? Object.entries(schema.properties) : []

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2 flex-wrap">
				{name && <code className="text-xs font-mono text-fg">{name}</code>}
				<code className="text-xs font-mono text-muted">{typestring(schema)}</code>
				{required && <span className="text-[10px] uppercase tracking-wide text-red-400">required</span>}
				{schema.format && <span className="text-[10px] uppercase tracking-wide text-dim">{schema.format}</span>}
			</div>
			{schema.description && <p className="text-sm text-muted">{schema.description}</p>}
			{schema.default !== undefined && (
				<div className="text-xs text-dim">
					default: <code className="font-mono">{scalar(schema.default)}</code>
				</div>
			)}
			{schema.example !== undefined && (
				<div className="text-xs text-dim">
					example: <code className="font-mono">{scalar(schema.example)}</code>
				</div>
			)}
			{properties.length > 0 && (
				<ul className="space-y-2 border-l border-line pl-3" role="list">
					{properties.map(([key, value]) => (
						<li key={key}>
							<Openapischema
								schema={value}
								name={key}
								required={schema.required?.includes(key)}
							/>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

export const Openapischema = memo(OpenapischemaBase)
