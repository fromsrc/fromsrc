import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const docsdir = join(root, "docs");
const issues = [];
let metacount = 0;
let foldercount = 0;

function rel(value) {
	return value.slice(root.length + 1).replace(/\\/g, "/");
}

function isseparator(value) {
	return value.startsWith("---");
}

async function validate(dir) {
	foldercount += 1;
	const entries = await readdir(dir, { withFileTypes: true });
	const files = new Set();
	const dirs = new Set();
	const path = rel(dir);
	const metafile = join(dir, "_meta.json");

	for (const entry of entries) {
		if (entry.isFile() && entry.name.endsWith(".mdx")) files.add(entry.name.slice(0, -4));
		if (entry.isDirectory()) dirs.add(entry.name);
	}

	try {
		const raw = await readFile(metafile, "utf8");
		metacount += 1;
		const meta = JSON.parse(raw);
		const pages = Array.isArray(meta.pages) ? meta.pages : [];
		if (path === "docs" && pages.length === 0) issues.push("docs/_meta.json pages list is empty");

		const seen = new Set();
		for (const page of pages) {
			if (typeof page !== "string" || page.trim().length === 0) {
				issues.push(`${path}/_meta.json has invalid page key`);
				continue;
			}
			if (seen.has(page)) issues.push(`${path}/_meta.json duplicate page key: ${page}`);
			seen.add(page);
			if (isseparator(page)) continue;
			if (!files.has(page) && !dirs.has(page)) issues.push(`${path}/_meta.json points to missing entry: ${page}`);
		}

		for (const name of files) {
			if (name === "index") continue;
			if (!seen.has(name)) issues.push(`${path}/_meta.json missing entry: ${name}`);
		}
	} catch {}

	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		await validate(join(dir, entry.name));
	}
}

await validate(docsdir);

if (issues.length > 0) {
	console.error("x docs meta validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o docs meta validation passed (${metacount} meta files, ${foldercount} folders)`);
