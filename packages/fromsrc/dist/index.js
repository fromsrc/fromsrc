// src/content.ts
import { readFile, readdir } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import { z as z2 } from "zod";

// src/schema.ts
import { z } from "zod";
var baseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  order: z.number().optional()
});
function defineSchema(schema) {
  return baseSchema.merge(schema);
}
function extendSchema(fields) {
  return baseSchema.extend(fields);
}

// src/content.ts
function defineContent(config) {
  const schema = config.schema ?? baseSchema;
  async function getDoc2(slug) {
    const path = slug.length === 0 ? "index" : slug.join("/");
    const filepath = join(config.dir, `${path}.mdx`);
    try {
      const source = await readFile(filepath, "utf-8");
      const { data, content } = matter(source);
      const parsed = schema.parse(data);
      return {
        slug: path,
        ...parsed,
        content,
        data: parsed
      };
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.error(`Schema validation failed for ${filepath}:`);
        console.error(error.errors);
        throw error;
      }
      return null;
    }
  }
  async function getAllDocs2() {
    const docs = [];
    async function scan(dir, prefix = "") {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          await scan(join(dir, entry.name), `${prefix}${entry.name}/`);
        } else if (entry.name.endsWith(".mdx")) {
          const filepath = join(dir, entry.name);
          const source = await readFile(filepath, "utf-8");
          const { data } = matter(source);
          const parsed = schema.parse(data);
          const slug = `${prefix}${entry.name.replace(".mdx", "")}`;
          docs.push({
            slug: slug === "index" ? "" : slug,
            ...parsed
          });
        }
      }
    }
    try {
      await scan(config.dir);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        throw error;
      }
      return [];
    }
    return docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }
  async function getNavigation2() {
    const docs = await getAllDocs2();
    const sections = [
      { title: "introduction", items: [] },
      { title: "components", items: [] },
      { title: "api", items: [] }
    ];
    for (const doc of docs) {
      if (doc.slug.startsWith("components/")) {
        sections[1].items.push(doc);
      } else if (doc.slug.startsWith("api/")) {
        sections[2].items.push(doc);
      } else {
        sections[0].items.push(doc);
      }
    }
    return sections.filter((s) => s.items.length > 0);
  }
  return {
    getDoc: getDoc2,
    getAllDocs: getAllDocs2,
    getNavigation: getNavigation2,
    schema
  };
}
async function getDoc(docsDir, slug) {
  const path = slug.length === 0 ? "index" : slug.join("/");
  const filepath = join(docsDir, `${path}.mdx`);
  try {
    const source = await readFile(filepath, "utf-8");
    const { data, content } = matter(source);
    const parsed = baseSchema.parse(data);
    return {
      slug: path,
      title: parsed.title,
      description: parsed.description,
      order: parsed.order,
      content,
      data: parsed
    };
  } catch (error) {
    if (error instanceof z2.ZodError) {
      console.error(`Schema validation failed for ${filepath}:`);
      console.error(error.errors);
      throw error;
    }
    return null;
  }
}
async function getAllDocs(docsDir) {
  const docs = [];
  async function scan(dir, prefix = "") {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        await scan(join(dir, entry.name), `${prefix}${entry.name}/`);
      } else if (entry.name.endsWith(".mdx")) {
        const filepath = join(dir, entry.name);
        const source = await readFile(filepath, "utf-8");
        const { data } = matter(source);
        const parsed = baseSchema.parse(data);
        const slug = `${prefix}${entry.name.replace(".mdx", "")}`;
        docs.push({
          slug: slug === "index" ? "" : slug,
          title: parsed.title,
          description: parsed.description,
          order: parsed.order
        });
      }
    }
  }
  try {
    await scan(docsDir);
  } catch (error) {
    if (error instanceof z2.ZodError) {
      throw error;
    }
    return [];
  }
  return docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}
async function getNavigation(docsDir) {
  const docs = await getAllDocs(docsDir);
  const sections = [
    { title: "introduction", items: [] },
    { title: "components", items: [] },
    { title: "api", items: [] }
  ];
  for (const doc of docs) {
    if (doc.slug.startsWith("components/")) {
      sections[1].items.push(doc);
    } else if (doc.slug.startsWith("api/")) {
      sections[2].items.push(doc);
    } else {
      sections[0].items.push(doc);
    }
  }
  return sections.filter((s) => s.items.length > 0);
}
export {
  baseSchema,
  defineContent,
  defineSchema,
  extendSchema,
  getAllDocs,
  getDoc,
  getNavigation,
  z
};
