import { measure } from "./nextbundlemeasure.mjs";
import { targets } from "./nextbundleset.mjs";

let fail = false;

for (const target of targets) {
	try {
		const now = await measure(target);
		const line = `${target.name}: ${now.size}b gzip:${now.gzip}b (max ${target.max}b / ${target.maxgzip}b)`;
		if (now.size > target.max || now.gzip > target.maxgzip) {
			fail = true;
			console.error(`x ${line}`);
		} else {
			console.log(`o ${line}`);
		}
	} catch (error) {
		fail = true;
		const message = error instanceof Error ? error.message : String(error);
		console.error(`x ${target.name}: ${message}`);
	}
}

if (fail) process.exit(1);
