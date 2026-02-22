import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { frameworks } from "./frameworkset.mjs";

const file = join(process.cwd(), "scripts", "scaffoldcheck.mjs");
const text = await readFile(file, "utf8");

const parsed = [...text.matchAll(/name:\s*"([^"]+)"/g)].map((entry) => entry[1]);
const unique = [...new Set(parsed)];

const missing = frameworks.filter((name) => !unique.includes(name));
const extra = unique.filter((name) => !frameworks.includes(name));

if (missing.length > 0 || extra.length > 0 || unique.length !== frameworks.length) {
	console.error("x scaffold framework validation failed");
	for (const name of missing) console.error(`missing framework: ${name}`);
	for (const name of extra) console.error(`unexpected framework: ${name}`);
	if (unique.length !== frameworks.length) {
		console.error(`expected ${frameworks.length} frameworks, found ${unique.length}`);
	}
	process.exit(1);
}

console.log(`o scaffold framework validation passed (${unique.length} frameworks)`);
