import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { manuals } from "./frameworkset.mjs";

const file = join(process.cwd(), "docs", "manual", "index.mdx");
const text = await readFile(file, "utf8");

const issues = [];
for (const item of manuals) {
	if (!text.includes(item.card)) issues.push(`missing ${item.card}`);
	if (!text.includes(item.href)) issues.push(`missing ${item.href}`);
}

if (issues.length > 0) {
	console.error("x manual index contract validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o manual index contract validation passed (${manuals.length} cards)`);
