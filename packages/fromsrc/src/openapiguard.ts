import { z } from "zod"

const tagschema = z.object({ name: z.string().min(1), description: z.string().optional() })

export const rootschema = z.object({
	info: z
		.object({
			title: z.string().default(""),
			version: z.string().default(""),
			description: z.string().optional(),
		})
		.default({ title: "", version: "" }),
	paths: z.record(z.string(), z.unknown()).default({}),
	tags: z.array(tagschema).default([]),
	components: z.object({ schemas: z.record(z.string(), z.unknown()).optional() }).optional(),
	definitions: z.record(z.string(), z.unknown()).optional(),
})

export function parsespec(spec: string | object): unknown {
	if (typeof spec === "string") {
		const text = spec.trim()
		if (text.length === 0) {
			throw new Error("invalid openapi specification")
		}
		return JSON.parse(text)
	}
	return spec
}
