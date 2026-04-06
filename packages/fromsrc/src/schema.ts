import { z } from "zod";

/** Base frontmatter schema with title, description, draft, and order fields. */
export const baseSchema = z.object({
  description: z.string().optional(),
  draft: z.boolean().optional(),
  order: z.number().optional(),
  title: z.string(),
});

/** Infers the TypeScript type from a zod schema. */
export type InferSchema<T extends z.ZodType> = z.infer<T>;

/** Merges a custom zod object schema with the base frontmatter schema. */
export function defineSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return baseSchema.merge(schema);
}

/** Extends the base frontmatter schema with additional zod fields. */
export function extendSchema<T extends z.ZodRawShape>(fields: T) {
  return baseSchema.extend(fields);
}

export { z };
