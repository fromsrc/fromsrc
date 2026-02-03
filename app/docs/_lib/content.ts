import { join } from "node:path"
import { defineContent, z } from "fromsrc"

const content = defineContent({
	dir: join(process.cwd(), "docs"),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		order: z.number().optional(),
	}),
})

export const getDoc = content.getDoc
export const getAllDocs = content.getAllDocs
export const getNavigation = content.getNavigation
export const getSearchDocs = content.getSearchDocs
