import { join } from "node:path";
import { baseSchema } from "../packages/fromsrc/src/schema.ts";
import { defineContent, getNavigation as getnav } from "../packages/fromsrc/src/content.ts";

const docsdir = join(process.cwd(), "docs");
const content = defineContent({ dir: docsdir, schema: baseSchema });

const [local, exported] = await Promise.all([content.getNavigation(), getnav(docsdir)]);

const localtitles = local.map((item) => item.title);
const exportedtitles = exported.map((item) => item.title);

const issues = [];

if (!localtitles.includes("manual")) issues.push("defineContent navigation missing manual section");
if (!exportedtitles.includes("manual")) issues.push("exported navigation missing manual section");
if (localtitles.join("|") !== exportedtitles.join("|")) issues.push("navigation section order mismatch");

for (const title of localtitles) {
	const left = local.find((item) => item.title === title)?.items.length ?? 0;
	const right = exported.find((item) => item.title === title)?.items.length ?? 0;
	if (left !== right) issues.push(`navigation item count mismatch for ${title}: ${left} vs ${right}`);
}

if (issues.length > 0) {
	console.error("x navigation contract validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o navigation contract validation passed (${localtitles.length} sections)`);
