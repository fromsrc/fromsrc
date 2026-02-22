import { readFile } from "node:fs/promises";
import { join } from "node:path";

const file = join(process.cwd(), "scripts", "scaffoldsmoke.mjs");
const text = await readFile(file, "utf8");

const expected = ["next.js", "react-router", "vite", "tanstack", "remix", "astro"];

const match = text.match(/const defaults = \[(.*?)\];/s);
if (!match || !match[1]) {
	console.error("x scaffold smoke framework validation failed");
	console.error("missing defaults array in scaffoldsmoke.mjs");
	process.exit(1);
}

const parsed = [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
const missing = expected.filter((name) => !parsed.includes(name));
const extra = parsed.filter((name) => !expected.includes(name));

if (missing.length > 0 || extra.length > 0) {
	console.error("x scaffold smoke framework validation failed");
	for (const name of missing) console.error(`missing framework: ${name}`);
	for (const name of extra) console.error(`unexpected framework: ${name}`);
	process.exit(1);
}

if (parsed.length !== expected.length) {
	console.error("x scaffold smoke framework validation failed");
	console.error(`duplicate or malformed entries detected: ${parsed.join(", ")}`);
	process.exit(1);
}

console.log(`o scaffold smoke framework validation passed (${parsed.length} frameworks)`);
