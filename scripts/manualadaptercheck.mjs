import { readFile } from "node:fs/promises";
import { join } from "node:path";

const checks = [
	{
		file: "docs/manual/next.mdx",
		tokens: ["fromsrc/next", "AdapterProvider", "nextAdapter"],
	},
	{
		file: "docs/manual/react-router.mdx",
		tokens: ["fromsrc/react-router", "AdapterProvider", "reactRouterAdapter"],
	},
	{
		file: "docs/manual/vite.mdx",
		tokens: ["fromsrc/vite", "AdapterProvider", "viteAdapter", "createadapter"],
	},
	{
		file: "docs/manual/tanstack.mdx",
		tokens: ["fromsrc/tanstack", "AdapterProvider", "tanstackAdapter"],
	},
	{
		file: "docs/manual/remix.mdx",
		tokens: ["fromsrc/remix", "AdapterProvider", "remixAdapter"],
	},
	{
		file: "docs/manual/astro.mdx",
		tokens: ["fromsrc/astro", "AdapterProvider", "astroAdapter"],
	},
];

const issues = [];

for (const check of checks) {
	const text = await readFile(join(process.cwd(), check.file), "utf8");
	for (const token of check.tokens) {
		if (!text.includes(token)) {
			issues.push(`${check.file} missing ${token}`);
		}
	}
}

if (issues.length > 0) {
	console.error("x manual adapter contract validation failed");
	for (const issue of issues) {
		console.error(issue);
	}
	process.exit(1);
}

console.log(`o manual adapter contracts passed (${checks.length} files)`);
