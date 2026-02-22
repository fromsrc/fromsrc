import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

const rules = [
	{
		name: "api-docs-list",
		file: "app/api/docs/route.ts",
		patterns: ['from "@/app/api/_lib/json"', "sendjson(", "const cache ="],
	},
	{
		name: "api-manifest",
		file: "app/api/manifest/route.ts",
		patterns: ['from "@/app/api/_lib/json"', "sendjson(", "const cache ="],
	},
	{
		name: "api-stats",
		file: "app/api/stats/route.ts",
		patterns: ['from "@/app/api/_lib/json"', "sendjson(", "const cache ="],
	},
	{
		name: "api-search",
		file: "app/api/search/route.ts",
		patterns: ['from "@/app/api/_lib/json"', "sendjsonwithheaders(", "const cachecontrol ="],
	},
	{
		name: "api-search-index",
		file: "app/api/search-index/route.ts",
		patterns: ['from "@/app/api/_lib/json"', "sendjsonwithheaders(", "const cachecontrol ="],
	},
	{
		name: "api-mcp",
		file: "app/api/mcp/route.ts",
		patterns: ['from "@/app/api/_lib/json"', "sendjson(", "const cachecontrol ="],
	},
	{
		name: "api-health",
		file: "app/api/health/route.ts",
		patterns: ['from "@/app/api/_lib/json"', "sendjson(", 'const cache = "no-store"'],
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
	console.error("x api contract validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o api contract validation passed (${rules.length} routes)`);
