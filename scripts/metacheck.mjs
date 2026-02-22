import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const docsdir = join(root, "docs");
const metafile = join(docsdir, "_meta.json");

const issues = [];

const meta = JSON.parse(await readFile(metafile, "utf8"));
const pages = Array.isArray(meta.pages) ? meta.pages : [];
if (pages.length === 0) issues.push("meta pages list is empty");

const seen = new Set();
for (const page of pages) {
	if (typeof page !== "string" || page.trim().length === 0) {
		issues.push("meta pages must be non-empty strings");
		continue;
	}
	if (seen.has(page)) issues.push(`duplicate page key in _meta.json: ${page}`);
	seen.add(page);
}

const entries = await readdir(docsdir, { withFileTypes: true });
const top = entries
	.filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
	.map((entry) => entry.name.slice(0, -4))
	.filter((name) => name !== "index")
	.sort();

for (const slug of top) {
	if (!seen.has(slug)) issues.push(`missing from _meta.json pages: ${slug}`);
}

for (const slug of pages) {
	if (typeof slug !== "string") continue;
	const target = join(docsdir, `${slug}.mdx`);
	try {
		await readFile(target, "utf8");
	} catch {
		issues.push(`meta page points to missing file: ${slug}.mdx`);
	}
}

if (issues.length > 0) {
	console.error("x docs meta validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o docs meta validation passed (${top.length} top-level pages)`);
