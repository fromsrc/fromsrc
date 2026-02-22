import { readFile } from "node:fs/promises";
import { join } from "node:path";

const file = join(process.cwd(), "docs", "manual", "index.mdx");
const text = await readFile(file, "utf8");

const required = [
	{ title: 'title="next.js"', href: 'href="/docs/manual/next"' },
	{ title: 'title="react router"', href: 'href="/docs/manual/react-router"' },
	{ title: 'title="tanstack start"', href: 'href="/docs/manual/tanstack"' },
	{ title: 'title="vite"', href: 'href="/docs/manual/vite"' },
	{ title: 'title="remix"', href: 'href="/docs/manual/remix"' },
	{ title: 'title="astro"', href: 'href="/docs/manual/astro"' },
];

const issues = [];
for (const item of required) {
	if (!text.includes(item.title)) issues.push(`missing ${item.title}`);
	if (!text.includes(item.href)) issues.push(`missing ${item.href}`);
}

if (issues.length > 0) {
	console.error("x manual index contract validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o manual index contract validation passed (${required.length} cards)`);
