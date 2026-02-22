import { readFile } from "node:fs/promises";
import { targets } from "./nextbundleset.mjs";

const raw = await readFile(new URL("./nextbundlebaseline.json", import.meta.url), "utf8");
const base = JSON.parse(raw);
const names = new Set(targets.map((target) => target.name));
let fail = false;

for (const target of targets) {
	const mark = base[target.name];
	if (!mark) {
		console.error(`x missing baseline: ${target.name}`);
		fail = true;
		continue;
	}
	if (!Number.isInteger(mark.size) || mark.size < 0) {
		console.error(`x invalid baseline size for ${target.name}`);
		fail = true;
	}
	if (!Number.isInteger(mark.gzip) || mark.gzip < 0) {
		console.error(`x invalid baseline gzip for ${target.name}`);
		fail = true;
	}
	if (mark.size > target.max || mark.gzip > target.maxgzip) {
		console.error(`x baseline exceeds max budget for ${target.name}`);
		fail = true;
	}
}

for (const key of Object.keys(base)) {
	if (!names.has(key)) {
		console.error(`x stale baseline key: ${key}`);
		fail = true;
	}
}

if (fail) {
	process.exit(1);
}

console.log(`o next bundle baseline contract validation passed (${targets.length} entries)`);
