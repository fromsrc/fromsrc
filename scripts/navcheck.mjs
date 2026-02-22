import { join } from "node:path";
import { baseSchema } from "../packages/fromsrc/src/schema.ts";
import { defineContent, getNavigation as getnav } from "../packages/fromsrc/src/content.ts";
import { loadMeta } from "../packages/fromsrc/src/meta.ts";

const docsdir = join(process.cwd(), "docs");
const content = defineContent({ dir: docsdir, schema: baseSchema });

const [local, exported] = await Promise.all([content.getNavigation(), getnav(docsdir)]);

const localtitles = local.map((item) => item.title);
const exportedtitles = exported.map((item) => item.title);
const key = (section) => {
	const slug = section.items[0]?.slug ?? "";
	if (!slug || slug === "index") return "";
	return slug.split("/")[0] ?? slug;
};
const localkeys = local.map((section) => key(section));
const exportedkeys = exported.map((section) => key(section));

const issues = [];

if (!localkeys.includes("manual")) issues.push("defineContent navigation missing manual section");
if (!exportedkeys.includes("manual")) issues.push("exported navigation missing manual section");
if (localkeys.join("|") !== exportedkeys.join("|")) issues.push("navigation section order mismatch");

for (const section of local) {
	const sectionKey = key(section);
	const left = section.items.length;
	const right = exported.find((item) => key(item) === sectionKey)?.items.length ?? 0;
	if (left !== right) issues.push(`navigation item count mismatch for ${sectionKey || "root"}: ${left} vs ${right}`);
}

const manualmeta = await loadMeta(join(docsdir, "manual"));
const manualpages = (manualmeta?.pages ?? []).filter((item) => item !== "index");
const expected = ["manual/index", ...manualpages.map((item) => `manual/${item}`)];
const actual = local.find((item) => key(item) === "manual")?.items.map((item) => item.slug) ?? [];
if (expected.length > 0 && expected.join("|") !== actual.join("|")) {
	issues.push("manual navigation order mismatch with docs/manual/_meta.json");
}

if (issues.length > 0) {
	console.error("x navigation contract validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o navigation contract validation passed (${localtitles.length} sections)`);
