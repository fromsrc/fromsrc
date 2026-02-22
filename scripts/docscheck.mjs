import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const docsroot = join(root, "docs");

function slug(value) {
	return value.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
}

function stripcode(text) {
	return text.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");
}

async function files(dir) {
	const list = await readdir(dir, { withFileTypes: true });
	const output = [];
	for (const entry of list) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			output.push(...(await files(path)));
			continue;
		}
		if (entry.isFile() && path.endsWith(".mdx")) output.push(path);
	}
	return output;
}

function frontmatter(text) {
	const match = text.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return null;
	const body = match[1] ?? "";
	const values = new Map();
	for (const line of body.split("\n")) {
		const index = line.indexOf(":");
		if (index < 1) continue;
		const key = line.slice(0, index).trim();
		if (!key) continue;
		const value = line.slice(index + 1).trim();
		values.set(key, value);
	}
	return values;
}

function headingids(text) {
	const seen = new Map();
	const ids = [];
	for (const match of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
		const value = match[1];
		if (!value) continue;
		const base = slug(value);
		if (!base) continue;
		const count = seen.get(base) ?? 0;
		seen.set(base, count + 1);
		ids.push(count === 0 ? base : `${base}-${count}`);
	}
	return ids;
}

function anchorlinks(text) {
	return [...text.matchAll(/\[[^\]]+\]\((#[^)]+)\)/g)]
		.map((match) => (match[1] ?? "").slice(1).trim().toLowerCase())
		.filter(Boolean);
}

const issues = [];
const list = await files(docsroot);

for (const file of list) {
	const raw = await readFile(file, "utf8");
	const data = frontmatter(raw);
	const name = file.slice(root.length + 1);
	if (!data) {
		issues.push(`${name}: missing frontmatter`);
		continue;
	}
	for (const key of ["title", "description"]) {
		const value = (data.get(key) ?? "").trim();
		if (!value) issues.push(`${name}: missing ${key}`);
	}
	const clean = stripcode(raw);
	const seen = new Set(headingids(clean));
	for (const target of anchorlinks(clean)) {
		if (!seen.has(target)) issues.push(`${name}: missing anchor target #${target}`);
	}
}

if (issues.length > 0) {
	console.error("x docs content validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o docs content validated (${list.length} files)`);
