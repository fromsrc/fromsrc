import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const file = join(root, "packages", "fromsrc", "package.json");

let text = "";
try {
	text = await readFile(file, "utf8");
} catch {
	console.error("x build script validation failed");
	console.error("missing file: packages/fromsrc/package.json");
	process.exit(1);
}

const pkg = JSON.parse(text);
const scripts = pkg.scripts ?? {};
const build = typeof scripts.build === "string" ? scripts.build.trim() : "";

const issues = [];
if (!build) issues.push("missing scripts.build");
if (!build.includes("tsup")) issues.push("scripts.build must run tsup");
if (/\brm\s+-rf\s+dist\b/.test(build)) issues.push("scripts.build must not delete dist before build");

if (issues.length > 0) {
	console.error("x build script validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log("o build script validation passed");
