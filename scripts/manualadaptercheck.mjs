import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { manuals } from "./frameworkset.mjs";

const issues = [];

for (const item of manuals) {
	const text = await readFile(join(process.cwd(), item.file), "utf8");
	for (const token of item.tokens) {
		if (!text.includes(token)) {
			issues.push(`${item.file} missing ${token}`);
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

console.log(`o manual adapter contracts passed (${manuals.length} files)`);
