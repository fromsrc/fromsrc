import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

const files = {
	pattern: "app/api/_lib/slugpattern.ts",
	slug: "app/api/_lib/slug.ts",
	rpc: "app/api/mcp/rpc.ts",
	docs: "scripts/docscheck.mjs",
};

const issues = [];

async function load(path) {
	try {
		return await readFile(join(root, path), "utf8");
	} catch {
		issues.push(`missing file: ${path}`);
		return "";
	}
}

const [pattern, slug, rpc, docs] = await Promise.all([
	load(files.pattern),
	load(files.slug),
	load(files.rpc),
	load(files.docs),
]);

const segment = pattern.match(/segmentpattern\s*=\s*"([^"]+)"/);
if (!segment) {
	issues.push("missing segmentpattern export");
} else {
	const value = segment[1] ?? "";
	if (!docs.includes(`const segment = /${value}/;`)) issues.push("docscheck segment regex drift");
}

if (!slug.includes('from "@/app/api/_lib/slugpattern"')) issues.push("slug route parser missing shared pattern import");
if (!slug.includes("segmentregex")) issues.push("slug route parser missing shared segment regex usage");
if (!slug.includes("segmentmdregex")) issues.push("slug route parser missing shared md segment regex usage");

if (!rpc.includes('from "@/app/api/_lib/slugpattern"')) issues.push("mcp rpc missing shared pattern import");
if (!rpc.includes("slugpathregex")) issues.push("mcp rpc missing shared slug path regex usage");

if (issues.length > 0) {
	console.error("x slug policy validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log("o slug policy validation passed");
