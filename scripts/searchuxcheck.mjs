import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

const files = [
	{
		name: "search-component",
		path: join(root, "packages", "fromsrc", "src", "components", "search.tsx"),
		patterns: ['event.key === "ArrowDown"', 'event.key === "ArrowUp"', 'event.key === "Home"', 'event.key === "End"', 'event.key === "Enter"'],
	},
	{
		name: "search-panel",
		path: join(root, "packages", "fromsrc", "src", "components", "panel.tsx"),
		patterns: ['role="combobox"', 'aria-expanded={showRecent || showResults}', 'aria-activedescendant={active}', 'role="dialog"', 'aria-modal="true"'],
	},
	{
		name: "search-results",
		path: join(root, "packages", "fromsrc", "src", "components", "results.tsx"),
		patterns: ['role="option"', "aria-selected={i === selected}", "getOptionId"],
	},
	{
		name: "search-recent",
		path: join(root, "packages", "fromsrc", "src", "components", "recent.tsx"),
		patterns: ['role="option"', "aria-selected={index === selected}", "getRecentOptionId"],
	},
];

const issues = [];

for (const file of files) {
	let text = "";
	try {
		text = await readFile(file.path, "utf8");
	} catch {
		issues.push(`${file.name} missing file`);
		continue;
	}
	for (const pattern of file.patterns) {
		if (!text.includes(pattern)) issues.push(`${file.name} missing pattern: ${pattern}`);
	}
}

if (issues.length > 0) {
	console.error("x search ux contract validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o search ux contract validation passed (${files.length} files)`);
