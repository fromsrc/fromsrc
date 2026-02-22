import { promises as fs } from "node:fs";
import path from "node:path";
import { parseimports } from "./imports.mjs";

const root = process.cwd();
const src = path.join(root, "packages", "fromsrc", "src");
const entry = path.join(src, "client.ts");

const localcache = new Map();
const importcache = new Map();
const issues = new Set();

async function fileexists(file) {
	try {
		const stat = await fs.stat(file);
		return stat.isFile();
	} catch {
		return false;
	}
}

async function resolvelocal(base, target) {
	const key = `${base}|${target}`;
	if (localcache.has(key)) return localcache.get(key);
	const basepath = path.resolve(path.dirname(base), target);
	const options = [
		basepath,
		`${basepath}.ts`,
		`${basepath}.tsx`,
		`${basepath}.mts`,
		`${basepath}.cts`,
		`${basepath}.js`,
		`${basepath}.mjs`,
		`${basepath}.cjs`,
		path.join(basepath, "index.ts"),
		path.join(basepath, "index.tsx"),
		path.join(basepath, "index.js"),
		path.join(basepath, "index.mjs"),
		path.join(basepath, "index.cjs"),
	];
	for (const option of options) {
		if (await fileexists(option)) {
			localcache.set(key, option);
			return option;
		}
	}
	localcache.set(key, null);
	return null;
}

function blocked(target) {
	if (target.startsWith("node:")) return true;
	const names = ["fs", "path", "child_process", "worker_threads", "module", "os", "crypto"];
	return names.includes(target);
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
