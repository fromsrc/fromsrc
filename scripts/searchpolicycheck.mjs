import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

const files = [
	{
		name: "api",
		file: join(root, "app", "api", "search", "route.ts"),
		pattern: /\.max\((\d+)\)/,
	},
	{
		name: "search-ui",
		file: join(root, "packages", "fromsrc", "src", "components", "search.tsx"),
		pattern: /const\s+maxquery\s*=\s*(\d+)/,
	},
	{
		name: "search-fetcher",
		file: join(root, "packages", "fromsrc", "src", "components", "searcher.ts"),
		pattern: /const\s+maxquery\s*=\s*(\d+)/,
	},
];

const values = [];
const issues = [];

for (const item of files) {
	try {
		const text = await readFile(item.file, "utf8");
		const match = text.match(item.pattern);
		const raw = match?.[1] ?? "";
		const value = Number(raw);
		if (!Number.isFinite(value) || value <= 0) {
			issues.push(`${item.name} missing max query value`);
			continue;
		}
		values.push({ name: item.name, value });
	} catch {
		issues.push(`${item.name} file missing`);
	}
}

if (values.length > 0) {
	const unique = new Set(values.map((item) => item.value));
	if (unique.size > 1) {
		const detail = values.map((item) => `${item.name}=${item.value}`).join(", ");
		issues.push(`search query limit mismatch (${detail})`);
	}
}

if (issues.length > 0) {
	console.error("x search policy validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

const value = values[0]?.value ?? 0;
console.log(`o search policy validation passed (max query ${value})`);
