import { readFile } from "node:fs/promises";
import path from "node:path";
import { clientkeys } from "./entryset.mjs";

const root = process.cwd();
const pkgfile = path.join(root, "packages", "fromsrc", "package.json");
const text = await readFile(pkgfile, "utf8");
const pkg = JSON.parse(text);
const map = pkg.exports ?? {};

function isclient(text) {
	const line = (text.split("\n", 1).at(0) ?? "").trim();
	return /^["']use client["'];?$/.test(line);
}

const issues = [];
for (const key of clientkeys) {
	const entry = map[key];
	if (!entry || typeof entry !== "object" || typeof entry.import !== "string") {
		issues.push(`missing import export for ${key}`);
		continue;
	}
	const file = path.join(root, "packages", "fromsrc", entry.import);
	try {
		const content = await readFile(file, "utf8");
		if (!isclient(content)) {
			issues.push(`${key} dist entry missing use client directive`);
		}
	} catch {
		issues.push(`${key} dist entry missing`);
	}
}

if (issues.length > 0) {
	console.error("x client directive validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o client directive validation passed (${clientkeys.length} entries)`);
