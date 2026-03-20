import { join } from "node:path";

import { defineContent, z } from "fromsrc";

const content = defineContent({
  dir: join(process.cwd(), "docs"),
  schema: z.object({
    description: z.string().optional(),
    order: z.number().optional(),
    title: z.string(),
  }),
});

export const { getDoc } = content;
export const { getDocs } = content;
export const { getAllDocs } = content;
export const { getNavigation } = content;
export const { getSearchDocs } = content;
