import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import matter from "gray-matter";

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

function doclinks(text) {
	return [...text.matchAll(/\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)]
		.map((match) => (match[1] ?? "").trim())
		.filter((target) => target && !target.startsWith("#") && !target.startsWith("http"));
}

function route(file) {
	const relative = file.slice(docsroot.length + 1).replace(/\\/g, "/");
	if (relative === "index.mdx") return "/docs";
	if (relative.endsWith("/index.mdx")) return `/docs/${relative.slice(0, -"/index.mdx".length)}`;
	return `/docs/${relative.slice(0, -".mdx".length)}`;
}

function parsepath(target) {
	let value = target.trim();
	let anchor = "";
	const hash = value.indexOf("#");
	if (hash !== -1) {
		anchor = value.slice(hash + 1).trim();
		value = value.slice(0, hash);
	}
	const query = value.indexOf("?");
	if (query !== -1) value = value.slice(0, query);
	const path = value.replace(/\/+$/, "");
	return {
		path: path || "/docs",
		anchor: normalizeanchor(anchor),
	};
}

function normalizeanchor(value) {
	if (!value) return "";
	try {
		return decodeURIComponent(value).trim().toLowerCase();
	} catch {
		return value.trim().toLowerCase();
	}
}

const issues = [];
const list = await files(docsroot);
const routes = new Set(list.map(route));
const fileset = new Set(list.map((file) => file.replace(/\\/g, "/")));
const routefile = new Map(list.map((file) => [route(file), file.replace(/\\/g, "/")]));
const idcache = new Map();

function localfile(file, target) {
	const { path: pathname } = parsepath(target);
	if (!pathname.startsWith(".")) return null;
	const direct = resolve(dirname(file), pathname);
	const options = [direct, `${direct}.mdx`, join(direct, "index.mdx")];
	for (const option of options) {
		const normalized = option.replace(/\\/g, "/");
		if (fileset.has(normalized)) return normalized;
	}
	return null;
}

async function anchorsfor(file) {
	const cached = idcache.get(file);
	if (cached) return cached;
	const raw = await readFile(file, "utf8");
	let content = raw;
	try {
		content = matter(raw).content;
	} catch {}
	const ids = new Set(headingids(stripcode(content)));
	idcache.set(file, ids);
	return ids;
}

for (const file of list) {
	const raw = await readFile(file, "utf8");
	const name = file.slice(root.length + 1);
	let parsed;
	try {
		parsed = matter(raw);
	} catch {
		issues.push(`${name}: invalid frontmatter`);
		continue;
	}
	const data = parsed.data;
	if (!data || Object.keys(data).length === 0) {
		issues.push(`${name}: missing frontmatter`);
		continue;
	}
	for (const key of ["title", "description"]) {
		const value = typeof data[key] === "string" ? data[key].trim() : "";
		if (!value) issues.push(`${name}: missing ${key}`);
	}
	const clean = stripcode(parsed.content);
	const seen = new Set(headingids(clean));
	for (const target of anchorlinks(clean)) {
		if (!seen.has(target)) issues.push(`${name}: missing anchor target #${target}`);
	}
	for (const target of doclinks(clean)) {
		if (target.startsWith("/docs")) {
			const { path: pathname, anchor } = parsepath(target);
			if (!routes.has(pathname)) issues.push(`${name}: missing docs route ${pathname}`);
			if (anchor) {
				const linked = routefile.get(pathname);
				if (linked) {
					const ids = await anchorsfor(linked);
					if (!ids.has(anchor)) issues.push(`${name}: missing docs anchor ${pathname}#${anchor}`);
				}
			}
			continue;
		}
		if (target.startsWith(".")) {
			const resolved = localfile(file, target);
			if (!resolved) issues.push(`${name}: missing local docs file ${target}`);
			const { anchor } = parsepath(target);
			if (resolved && anchor) {
				const ids = await anchorsfor(resolved);
				if (!ids.has(anchor)) issues.push(`${name}: missing local docs anchor ${target}`);
			}
		}
	}
}

if (issues.length > 0) {
	console.error("x docs content validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o docs content validated (${list.length} files)`);
