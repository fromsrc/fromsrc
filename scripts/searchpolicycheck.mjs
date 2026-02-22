import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

const files = [
	{
		name: "policy",
		file: join(root, "packages", "fromsrc", "src", "searchpolicy.ts"),
		pattern: /export\s+const\s+searchmaxquery\s*=\s*(\d+)/,
	},
	{
		name: "api-import",
		file: join(root, "app", "api", "search", "route.ts"),
		pattern: /from\s+["']fromsrc\/searchpolicy["']/,
	},
	{
		name: "api-usage",
		file: join(root, "app", "api", "search", "route.ts"),
		pattern: /\.max\(searchmaxquery\)/,
	},
	{
		name: "search-ui-import",
		file: join(root, "packages", "fromsrc", "src", "components", "search.tsx"),
		pattern: /from\s+["']\.\.\/searchpolicy["']/,
	},
	{
		name: "search-ui-usage",
		file: join(root, "packages", "fromsrc", "src", "components", "search.tsx"),
		pattern: /trimquery\(/,
	},
	{
		name: "search-fetcher-import",
		file: join(root, "packages", "fromsrc", "src", "components", "searcher.ts"),
		pattern: /from\s+["']\.\.\/searchpolicy["']/,
	},
	{
		name: "search-fetcher-usage-normalize",
		file: join(root, "packages", "fromsrc", "src", "components", "searcher.ts"),
		pattern: /normalizequery\(/,
	},
	{
		name: "search-fetcher-usage-trim",
		file: join(root, "packages", "fromsrc", "src", "components", "searcher.ts"),
		pattern: /trimquery\(/,
	},
];

const values = [];
const issues = [];

for (const item of files) {
	try {
		const text = await readFile(item.file, "utf8");
		const match = text.match(item.pattern);
		if (!match) {
			issues.push(`${item.name} policy missing`);
			continue;
		}
		if (item.name === "policy") {
			const raw = match[1] ?? "";
			const value = Number(raw);
			if (!Number.isFinite(value) || value <= 0) {
				issues.push("policy max query value invalid");
				continue;
			}
			values.push({ name: item.name, value });
		}
	} catch {
		issues.push(`${item.name} file missing`);
	}
}

if (issues.length > 0) {
	console.error("x search policy validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

const value = values[0]?.value ?? 0;
console.log(`o search policy validation passed (max query ${value})`);
