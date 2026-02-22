import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { frameworks } from "./frameworkset.mjs";

const file = join(process.cwd(), "scripts", "scaffoldsmoke.mjs");
const text = await readFile(file, "utf8");

const importline = 'import { frameworks as defaults } from "./frameworkset.mjs";';
if (!text.includes(importline)) {
	console.error("x scaffold smoke framework validation failed");
	console.error("missing defaults import from frameworkset.mjs");
	process.exit(1);
}

const fallbackline = "const frameworks = requested.length > 0 ? requested : defaults;";
if (!text.includes(fallbackline)) {
	console.error("x scaffold smoke framework validation failed");
	console.error("missing defaults fallback assignment");
	process.exit(1);
}

if (frameworks.length === 0) {
	console.error("x scaffold smoke framework validation failed");
	console.error("frameworkset.mjs returned no frameworks");
	process.exit(1);
}

console.log(`o scaffold smoke framework validation passed (${frameworks.length} frameworks)`);
