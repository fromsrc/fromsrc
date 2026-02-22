import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()

function load(path) {
	return readFileSync(join(root, path), "utf-8")
}

function expect(text, value, label) {
	if (!text.includes(value)) {
		throw new Error(`${label} missing: ${value}`)
	}
}

function reject(text, value, label) {
	if (text.includes(value)) {
		throw new Error(`${label} must not include: ${value}`)
	}
}

const slug = load("app/api/_lib/slug.ts")
expect(slug, "slug: z.array(segment).default([])", "slug params")
expect(slug, "slug: z.array(segmentmd).default([])", "slug params md")
reject(slug, "z.array(segment).min(1)", "slug params")
reject(slug, "z.array(segmentmd).min(1)", "slug params md")

const nativeui = load("app/components/native.tsx")
for (const path of ["/api/raw/auth", "/api/llms/auth", "/llms.txt", "/api/mcp"]) {
	expect(nativeui, path, "native endpoints")
}
expect(nativeui, "curl https://your-docs.com/api/llms/auth", "native curl")
for (const path of ["/docs/auth.md", "/docs/auth/llms.txt"]) {
	reject(nativeui, path, "native endpoints")
}

const templates = load("packages/create-fromsrc/src/templates.ts")
for (const key of ['"dev:up"', '"dev:status"', '"dev:down"']) {
	expect(templates, key, "create-fromsrc scripts")
}

const workflow = load(".github/workflows/bundle.yml")
reject(workflow, "bun-version: latest", "bundle workflow")

console.log("o critical contract validation passed")
