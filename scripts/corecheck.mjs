import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const files = [
	join(root, "packages", "fromsrc", "dist", "index.js"),
	join(root, "packages", "fromsrc", "dist", "index.d.ts"),
];

const blocked = [
	"react-router-dom",
	"@tanstack/react-router",
	"@remix-run/react",
];

const issues = [];

for (const file of files) {
	let text = "";
	try {
		text = await readFile(file, "utf8");
	} catch {
		issues.push(`missing build artifact ${file.replace(`${root}/`, "")}`);
		continue;
	}
	for (const name of blocked) {
		if (text.includes(name)) {
			issues.push(`core entry leaks optional adapter dependency: ${name}`);
		}
	}
}

if (issues.length > 0) {
	console.error("x core entry validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o core entry validation passed (${blocked.length} blocked deps)`);
