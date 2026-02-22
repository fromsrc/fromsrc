import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const file = join(root, "README.md");
const text = await readFile(file, "utf8");
const required = [
	"/api/raw/intro",
	"/api/llms/intro",
	"npx create-fromsrc --name my-docs --framework next.js --yes",
	"npx create-fromsrc --list",
];

const issues = [];
for (const item of required) {
	if (!text.includes(item)) {
		issues.push(`readme missing ${item}`);
	}
}

if (issues.length > 0) {
	console.error("x readme contract validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log("o readme contract validation passed");
