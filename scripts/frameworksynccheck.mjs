import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const frameworks = ["next.js", "react-router", "vite", "tanstack", "remix", "astro"];
const issues = [];

const files = [
	{
		path: "packages/create-fromsrc/src/index.ts",
		expect: frameworks,
	},
	{
		path: "scripts/scaffoldcheck.mjs",
		expect: frameworks,
	},
	{
		path: "scripts/adaptercheck.mjs",
		expect: ["fromsrc/next", "fromsrc/react-router", "fromsrc/vite", "fromsrc/tanstack", "fromsrc/remix", "fromsrc/astro"],
	},
	{
		path: "docs/frameworks.mdx",
		expect: ["fromsrc/next", "fromsrc/react-router", "fromsrc/vite", "fromsrc/tanstack", "fromsrc/remix", "fromsrc/astro"],
	},
];

for (const file of files) {
	let text = "";
	try {
		text = await readFile(join(root, file.path), "utf8");
	} catch {
		issues.push(`missing ${file.path}`);
		continue;
	}
	for (const token of file.expect) {
		if (!text.includes(token)) {
			issues.push(`${file.path} missing ${token}`);
		}
	}
}

if (issues.length > 0) {
	console.error("x framework sync validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o framework sync validation passed (${frameworks.length} frameworks)`);
