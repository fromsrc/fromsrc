import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const targets = [
	"packages/fromsrc/src/adapterreactrouter.ts",
	"packages/fromsrc/package.json",
	"docs/manual/react-router.mdx",
	"docs/manual/vite.mdx",
	"docs/installation.mdx",
	"scripts/sizecheck.mjs",
	"scripts/corecheck.mjs",
];

const issues = [];

for (const target of targets) {
	const file = join(root, target);
	const text = await readFile(file, "utf8");
	if (text.includes("react-router-dom")) {
		issues.push(`${target} contains react-router-dom`);
	}
}

if (issues.length > 0) {
	console.error("x router package validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o router package validation passed (${targets.length} files)`);
