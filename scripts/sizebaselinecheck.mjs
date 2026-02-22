import { readFile } from "node:fs/promises";
import { list } from "./sizeset.mjs";

const raw = await readFile(new URL("./sizebaseline.json", import.meta.url), "utf8");
const base = JSON.parse(raw);

const names = new Set(list.map((item) => item.name));
let fail = false;

for (const item of list) {
	const mark = base[item.name];
	if (!mark) {
		console.error(`x missing baseline: ${item.name}`);
		fail = true;
		continue;
	}
	if (!Number.isInteger(mark.size) || mark.size < 0) {
		console.error(`x invalid baseline size for ${item.name}`);
		fail = true;
	}
	if (!Number.isInteger(mark.gzip) || mark.gzip < 0) {
		console.error(`x invalid baseline gzip for ${item.name}`);
		fail = true;
	}
	if (mark.size > item.max || mark.gzip > item.maxgzip) {
		console.error(`x baseline exceeds max budget for ${item.name}`);
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

console.log(`o size baseline contract validation passed (${list.length} entries)`);
