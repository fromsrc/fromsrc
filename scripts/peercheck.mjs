import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const file = join(root, "packages", "fromsrc", "package.json");
const src = join(root, "packages", "fromsrc", "src");
const text = await readFile(file, "utf8");
const json = JSON.parse(text);

const peers = json.peerDependencies ?? {};
const meta = json.peerDependenciesMeta ?? {};
const dynamic = new Set();
const issues = [];
const optionalAllow = new Set(["@remix-run/react", "@tanstack/react-router", "react-router"]);

async function walk(dir) {
	const items = await readdir(dir, { withFileTypes: true });
	for (const item of items) {
		const path = join(dir, item.name);
		if (item.isDirectory()) {
			await walk(path);
			continue;
		}
		if (!item.isFile()) continue;
		if (!path.endsWith(".ts") && !path.endsWith(".tsx")) continue;
		const source = await readFile(path, "utf8");
		for (const match of source.matchAll(/import\("([^"]+)"\s+as\s+string\)/g)) {
			const name = match[1];
			if (name) dynamic.add(name);
		}
	}
}

await walk(src);
const needed = [...dynamic].sort();

for (const name of needed) {
	if (typeof peers[name] !== "string" || peers[name].trim().length === 0) {
		issues.push(`missing peer dependency ${name}`);
	}
	if (meta[name]?.optional !== true) {
		issues.push(`missing optional peer meta ${name}`);
	}
}

for (const name of Object.keys(meta)) {
	if (meta[name]?.optional !== true) continue;
	if (!needed.includes(name) && !optionalAllow.has(name)) {
		issues.push(`stale optional peer meta ${name}`);
	}
}

if (issues.length > 0) {
	console.error("x peer dependency contract validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o peer dependency contract validation passed (${needed.length} peers from source)`);
