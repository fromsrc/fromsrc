import { readFile } from "node:fs/promises";
import { join } from "node:path";

const files = [
	"docs/manual/react-router.mdx",
	"docs/manual/remix.mdx",
	"docs/manual/astro.mdx",
	"docs/manual/vite.mdx",
	"docs/manual/tanstack.mdx",
];

let fail = false;

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
