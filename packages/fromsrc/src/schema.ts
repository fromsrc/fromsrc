import { z } from "zod"

export const baseSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	order: z.number().optional(),
	draft: z.boolean().optional(),
})

export type InferSchema<T extends z.ZodType> = z.infer<T>

export function defineSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
	return baseSchema.merge(schema)
}

export function extendSchema<T extends z.ZodRawShape>(fields: T) {
	return baseSchema.extend(fields)
}

export { z }
