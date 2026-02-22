import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const src = join(root, "packages", "fromsrc", "src");
const docs = join(root, "docs", "frameworks.mdx");

const adapters = [
	{ key: "next", file: "next.ts", name: "nextAdapter", path: "fromsrc/next" },
	{ key: "react-router", file: "reactrouter.ts", name: "reactRouterAdapter", path: "fromsrc/react-router" },
	{ key: "vite", file: "vite.ts", name: "viteAdapter", path: "fromsrc/vite" },
	{ key: "tanstack", file: "tanstack.ts", name: "tanstackAdapter", path: "fromsrc/tanstack" },
	{ key: "remix", file: "remix.ts", name: "remixAdapter", path: "fromsrc/remix" },
	{ key: "astro", file: "astro.ts", name: "astroAdapter", path: "fromsrc/astro" },
];

const shared = ["AdapterProvider", "AdapterContext", "createadapter", "useAdapter"];
const issues = [];

for (const item of adapters) {
	const file = join(src, item.file);
	let text = "";
	try {
		text = await readFile(file, "utf8");
	} catch {
		issues.push(`missing adapter file ${item.file}`);
		continue;
	}
	if (!text.includes(`"${"use client"}"`)) issues.push(`${item.file} missing use client`);
	if (!text.includes(`export { ${item.name} }`)) issues.push(`${item.file} missing ${item.name} export`);
	for (const name of shared) {
		if (!text.includes(name)) issues.push(`${item.file} missing ${name} export`);
	}
}

let doc = "";
try {
	doc = await readFile(docs, "utf8");
} catch {
	issues.push("missing docs/frameworks.mdx");
}

if (doc) {
	for (const item of adapters) {
		if (!doc.includes(`\`${item.path}\``)) issues.push(`framework docs missing ${item.path}`);
	}
}

if (issues.length > 0) {
	console.error("x adapter contract validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o adapter contract validation passed (${adapters.length} adapters)`);
