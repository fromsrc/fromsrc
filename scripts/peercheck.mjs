import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const file = join(root, "packages", "fromsrc", "package.json");
const text = await readFile(file, "utf8");
const json = JSON.parse(text);

const needed = ["mermaid", "katex"];
const peers = json.peerDependencies ?? {};
const meta = json.peerDependenciesMeta ?? {};
const issues = [];

for (const name of needed) {
	if (typeof peers[name] !== "string" || peers[name].trim().length === 0) {
		issues.push(`missing peer dependency ${name}`);
	}
	if (meta[name]?.optional !== true) {
		issues.push(`missing optional peer meta ${name}`);
	}
}

if (issues.length > 0) {
	console.error("x peer dependency contract validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o peer dependency contract validation passed (${needed.length} peers)`);
