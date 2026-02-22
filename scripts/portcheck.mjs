import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const files = ["scripts/devup.mjs", "scripts/devstatus.mjs"];
const required = ["process.env.PORT || \"3000\""];

const issues = [];

for (const file of files) {
	const path = join(root, file);
	let text = "";
	try {
		text = await readFile(path, "utf8");
	} catch {
		issues.push(`missing file: ${file}`);
		continue;
	}
	for (const pattern of required) {
		if (!text.includes(pattern)) issues.push(`${file} missing pattern: ${pattern}`);
	}
}

if (issues.length > 0) {
	console.error("x dev port validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o dev port validation passed (${files.length} files)`);
