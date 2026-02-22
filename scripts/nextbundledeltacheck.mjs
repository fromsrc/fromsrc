import { readFile } from "node:fs/promises";
import { measure } from "./nextbundlemeasure.mjs";
import { targets } from "./nextbundleset.mjs";

const raw = await readFile(new URL("./nextbundlebaseline.json", import.meta.url), "utf8");
const base = JSON.parse(raw);
let fail = false;

for (const target of targets) {
	if (!base[target.name]) {
		console.error(`x missing baseline: ${target.name}`);
		fail = true;
	}
}

for (const target of targets) {
	const mark = base[target.name];
	if (!mark) continue;
	try {
		const now = await measure(target);
		const grow = now.size - mark.size;
		const growgzip = now.gzip - mark.gzip;
		const limit = Math.max(Math.ceil(mark.size * 0.08), 1500);
		const limitgzip = Math.max(Math.ceil(mark.gzip * 0.08), 500);
		if (grow > limit || growgzip > limitgzip) {
			fail = true;
			console.error(
				`x ${target.name}: +${grow}b/+${growgzip}b exceeds +${limit}b/+${limitgzip}b baseline guard`,
			);
		} else {
			console.log(`o ${target.name}: +${grow}b/+${growgzip}b within +${limit}b/+${limitgzip}b`);
		}
	} catch (error) {
		fail = true;
		const message = error instanceof Error ? error.message : String(error);
		console.error(`x ${target.name}: ${message}`);
	}
}

if (fail) process.exit(1);
