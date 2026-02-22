import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const files = [
	"app/api/manifest/route.ts",
	"app/api/stats/route.ts",
];
const issues = [];

for (const file of files) {
	const text = await readFile(join(root, file), "utf8");
	if (!text.includes("getDocs")) {
		issues.push(`missing getDocs import in ${file}`);
	}
	if (text.includes("getAllDocs") || text.includes("getDoc(")) {
		issues.push(`n+1 docs pattern found in ${file}`);
	}
}

if (issues.length > 0) {
	console.error("x api perf contract validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o api perf contract validation passed (${files.length} files)`);
