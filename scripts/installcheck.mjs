import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const file = join(root, "docs", "installation.mdx");
const text = await readFile(file, "utf8");
const required = [
	"bunx create-fromsrc",
	"bunx create-fromsrc --name my-docs --framework next.js --yes",
	"bunx create-fromsrc --list",
	"bun run typecheck",
];

const issues = [];
for (const item of required) {
	if (!text.includes(item)) {
		issues.push(`installation docs missing ${item}`);
	}
}

if (issues.length > 0) {
	console.error("x installation contract validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log("o installation contract validation passed");
