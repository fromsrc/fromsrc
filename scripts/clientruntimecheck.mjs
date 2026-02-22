import { promises as fs } from "node:fs";
import path from "node:path";
import { parseimports } from "./imports.mjs";
import { isnodeblocked } from "./runtimepolicy.mjs";
import { createresolver } from "./resolve.mjs";

const root = process.cwd();
const src = path.join(root, "packages", "fromsrc", "src");
const entry = path.join(src, "client.ts");

const importcache = new Map();
const issues = new Set();
const resolvelocal = createresolver();

function blocked(target) {
	return isnodeblocked(target);
}

async function scan(file, stack) {
	if (stack.has(file)) return;
	stack.add(file);
	let imports = importcache.get(file);
	if (!imports) {
		const text = await fs.readFile(file, "utf8");
		imports = parseimports(text);
		importcache.set(file, imports);
	}
	for (const target of imports) {
		if (!target) continue;
		if (blocked(target)) {
			issues.add(`${path.relative(root, file)} -> ${target}`);
			continue;
		}
		if (target.startsWith(".") || target.startsWith("/")) {
			const resolved = await resolvelocal(file, target);
			if (!resolved) {
				issues.add(`${path.relative(root, file)} -> ${target} (unresolved)`);
				continue;
			}
			await scan(resolved, stack);
		}
	}
	stack.delete(file);
}

await scan(entry, new Set());

if (issues.size > 0) {
	console.error("x client runtime dependency violations:");
	for (const issue of Array.from(issues).sort()) console.error(issue);
	process.exit(1);
}

console.log("o client runtime dependencies validated");
