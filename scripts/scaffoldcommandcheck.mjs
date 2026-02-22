import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const files = [
	"README.md",
	"docs/installation.mdx",
	"docs/components/terminal.mdx",
	"app/components/hero.tsx",
	"app/components/foot.tsx",
];

const issues = [];
for (const file of files) {
	const path = join(root, file);
	const text = await readFile(path, "utf8");
	if (text.includes("npx create-fromsrc")) {
		issues.push(`${file} uses npx create-fromsrc`);
	}
	if (!text.includes("bunx create-fromsrc")) {
		issues.push(`${file} missing bunx create-fromsrc`);
	}
}

if (issues.length > 0) {
	console.error("x scaffold command validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o scaffold command validation passed (${files.length} files)`);
