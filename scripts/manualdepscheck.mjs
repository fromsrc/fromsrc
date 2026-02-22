import { readFile } from "node:fs/promises";
import { join } from "node:path";

const checks = [
	{ file: "docs/manual/next.mdx", expected: "bun add fromsrc" },
	{ file: "docs/manual/react-router.mdx", expected: "bun add fromsrc react-router" },
	{ file: "docs/manual/vite.mdx", expected: "bun add fromsrc react-router" },
	{ file: "docs/manual/tanstack.mdx", expected: "bun add fromsrc @tanstack/react-router" },
	{ file: "docs/manual/remix.mdx", expected: "bun add fromsrc @remix-run/react" },
	{ file: "docs/manual/astro.mdx", expected: "bun add fromsrc" },
];

let fail = false;

for (const check of checks) {
	const text = await readFile(join(process.cwd(), check.file), "utf8");
	if (!text.includes(check.expected)) {
		fail = true;
		console.error(`x manual dependency contract failed: ${check.file} missing \"${check.expected}\"`);
	}
}

if (fail) {
	process.exit(1);
}

console.log(`o manual dependency contracts passed (${checks.length} files)`);
