import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

const rules = [
	{
		name: "llms-index",
		file: "app/llms.txt/route.ts",
		patterns: ['from "@/app/api/_lib/text"', "return send("],
	},
	{
		name: "llms-full",
		file: "app/llms-full.txt/route.ts",
		patterns: ['from "@/app/api/_lib/text"', "return send("],
	},
	{
		name: "raw-markdown",
		file: "app/api/raw/[...slug]/route.ts",
		patterns: ['from "@/app/api/_lib/text"', "return send("],
	},
	{
		name: "docs-markdown",
		file: "app/api/docs/[...slug]/route.ts",
		patterns: ['from "@/app/api/_lib/text"', "return sendmarkdown("],
	},
	{
		name: "mcp-route",
		file: "app/api/mcp/route.ts",
		patterns: ['from "@/app/api/_lib/json"', "sendjson("],
	},
	{
		name: "well-known-llms",
		file: "app/.well-known/llms.txt/route.ts",
		patterns: ['redirect("/llms.txt")'],
	},
	{
		name: "well-known-llms-full",
		file: "app/.well-known/llms-full.txt/route.ts",
		patterns: ['redirect("/llms-full.txt")'],
	},
];

const issues = [];

for (const rule of rules) {
	const path = join(root, rule.file);
	let text = "";
	try {
		text = await readFile(path, "utf8");
	} catch {
		issues.push(`${rule.name} missing file: ${rule.file}`);
		continue;
	}
	for (const pattern of rule.patterns) {
		if (!text.includes(pattern)) issues.push(`${rule.name} missing pattern: ${pattern}`);
	}
}

if (issues.length > 0) {
	console.error("x ai endpoint contract validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o ai endpoint contract validation passed (${rules.length} routes)`);
