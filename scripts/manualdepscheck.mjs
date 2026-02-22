import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { manuals } from "./frameworkset.mjs";

let fail = false;

for (const item of manuals) {
	const text = await readFile(join(process.cwd(), item.file), "utf8");
	if (!text.includes(item.install)) {
		fail = true;
		console.error(`x manual dependency contract failed: ${item.file} missing \"${item.install}\"`);
	}
}

if (fail) {
	process.exit(1);
}

console.log(`o manual dependency contracts passed (${manuals.length} files)`);
