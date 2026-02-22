import { promises as fs } from "node:fs";
import path from "node:path";
import { isclientdirective } from "./clientutil.mjs";
import { parseimports } from "./imports.mjs";
import { isnodeblocked } from "./runtimepolicy.mjs";
import { createresolver } from "./resolve.mjs";

const root = process.cwd();
const src = path.join(root, "packages", "fromsrc", "src");

const entries = [
	"readtime.ts",
	"searchscore.ts",
	"searchindex.ts",
	"llms.ts",
	"openapi.ts",
	"algolia.ts",
	"orama.ts",
];

const blocked = [
	"react",
	"react-dom",
	"next",
	"next-mdx-remote",
	"@mdx-js/mdx",
	"shiki",
	"katex",
	"lucide-react",
];

const externalcache = new Map();
const issues = new Set();
const resolvelocal = createresolver();

function addissue(file, target, entry) {
	issues.add(`${path.relative(root, file)} -> ${target} (entry: ${entry})`);
}

function isblocked(target) {
	if (target.endsWith(".css")) return true;
	if (isnodeblocked(target)) return true;
	for (const item of blocked) {
		if (target === item || target.startsWith(`${item}/`)) return true;
	}
	return false;
}

async function scanfile(file, entry, stack) {
	if (stack.has(file)) return;
	stack.add(file);
	if (file.endsWith(".css")) {
		addissue(file, "css side effect", entry);
		stack.delete(file);
		return;
	}
	let imports = externalcache.get(file);
	if (!imports) {
		const text = await fs.readFile(file, "utf8");
		if (isclientdirective(text)) {
			addissue(file, "use client directive", entry);
		}
		imports = parseimports(text);
		externalcache.set(file, imports);
	}
	for (const target of imports) {
		if (!target) continue;
		if (isblocked(target)) {
			addissue(file, target, entry);
			continue;
		}
		if (target.startsWith(".") || target.startsWith("/")) {
			const resolved = await resolvelocal(file, target);
			if (!resolved) {
				addissue(file, `${target} (unresolved)`, entry);
				continue;
			}
			await scanfile(resolved, entry, stack);
		}
	}
	stack.delete(file);
}

for (const name of entries) {
	const file = path.join(src, name);
	await scanfile(file, name, new Set());
}

if (issues.size > 0) {
	console.error("x lightweight entrypoint dependency violations:");
	for (const issue of Array.from(issues).sort()) console.error(issue);
	process.exit(1);
}

console.log(`o lightweight entrypoint dependencies validated (${entries.length} files)`);
