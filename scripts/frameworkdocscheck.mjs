import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { manuals } from "./frameworkset.mjs";

const files = manuals
	.map((entry) => entry.file)
	.filter((file) => file !== "docs/manual/next.mdx");

let fail = false;

if (files.length === 0) {
	console.error("x framework docs validation failed");
	console.error("no framework manuals found");
	process.exit(1);
}

for (const file of files) {
	const text = await readFile(join(process.cwd(), file), "utf8");
	if (text.includes('"use client"') || text.includes("'use client'")) {
		fail = true;
		console.error(`x framework docs contain use client: ${file}`);
	}
}

if (fail) {
	process.exit(1);
}

console.log(`o framework docs validation passed (${files.length} files)`);
