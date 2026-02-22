import { readFile } from "node:fs/promises";
import path from "node:path";
import { entrymap } from "./entryset.mjs";

const root = process.cwd();
const pkgfile = path.join(root, "packages", "fromsrc", "package.json");
const srcroot = path.join(root, "packages", "fromsrc", "src");

const text = await readFile(pkgfile, "utf8");
const pkg = JSON.parse(text);
const map = pkg.exports ?? {};
const issues = [];

for (const [key, source] of entrymap.entries()) {
	const value = map[key];
	if (!value) {
		issues.push(`missing export key ${key}`);
		continue;
	}
	if (typeof value === "string") {
		if (!key.endsWith(".css")) issues.push(`${key} must use types/import export object`);
		continue;
	}
	if (typeof value !== "object") {
		issues.push(`${key} must be export object`);
		continue;
	}
	const types = value.types;
	const runtime = value.import;
	if (typeof types !== "string" || typeof runtime !== "string") {
		issues.push(`${key} must define string types and import paths`);
		continue;
	}
	const base = key === "." ? "index" : key.replace("./", "").replace("-", "");
	if (!types.endsWith(`/${base}.d.ts`)) issues.push(`${key} has unexpected types path ${types}`);
	if (!runtime.endsWith(`/${base}.js`)) issues.push(`${key} has unexpected import path ${runtime}`);
	if (!source) continue;
	const full = path.join(srcroot, source);
	try {
		await readFile(full, "utf8");
	} catch {
		issues.push(`${key} source file missing: ${source}`);
	}
}

for (const key of Object.keys(map)) {
	if (!entrymap.has(key)) issues.push(`unexpected export key ${key}`);
}

if (issues.length > 0) {
	console.error("x export map validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o export map validation passed (${entrymap.size} keys)`);
