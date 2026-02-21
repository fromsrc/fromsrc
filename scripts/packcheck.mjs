import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const file = join(root, "packages/fromsrc/package.json");
const text = await readFile(file, "utf8");
const pkg = JSON.parse(text);

const list = [];
const exportsMap = pkg.exports ?? {};

for (const [key, value] of Object.entries(exportsMap)) {
	if (typeof value === "string") {
		list.push({ key, path: value });
		continue;
	}
	if (!value || typeof value !== "object") continue;
	for (const [subkey, subvalue] of Object.entries(value)) {
		if (typeof subvalue !== "string") continue;
		list.push({ key: `${key}:${subkey}`, path: subvalue });
	}
}

let fail = false;
for (const entry of list) {
	const full = join(root, "packages/fromsrc", entry.path);
	try {
		const data = await stat(full);
		if (!data.isFile()) {
			fail = true;
			console.error(`x ${entry.key} -> ${entry.path} not a file`);
			continue;
		}
		console.log(`o ${entry.key} -> ${entry.path}`);
	} catch {
		fail = true;
		console.error(`x ${entry.key} -> ${entry.path} missing`);
	}
}

if (!Array.isArray(pkg.files) || !pkg.files.includes("dist")) {
	fail = true;
	console.error("x files[] must include dist");
}
if (!Array.isArray(pkg.files) || !pkg.files.includes("styles")) {
	fail = true;
	console.error("x files[] must include styles");
}

if (fail) process.exit(1);
