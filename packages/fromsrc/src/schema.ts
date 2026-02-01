import { z } from "zod"

export const baseSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	order: z.number().optional(),
})

export type BaseSchema = typeof baseSchema

export type InferSchema<T extends z.ZodType> = z.infer<T>

export function defineSchema<T extends z.ZodObject<z.ZodRawShape>>(
	schema: T
): T {
	return baseSchema.merge(schema) as unknown as T
}

export function extendSchema<T extends z.ZodRawShape>(fields: T) {
	return baseSchema.extend(fields)
}

export { z }
