import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { adapterpaths, adapters, frameworks, manuals } from "./frameworkset.mjs";

const issues = [];
const root = process.cwd();

function uniq(values) {
	return [...new Set(values)];
}

if (frameworks.length === 0) {
	issues.push("frameworks is empty");
}

if (uniq(frameworks).length !== frameworks.length) {
	issues.push("frameworks contains duplicates");
}

if (adapterpaths.length !== frameworks.length) {
	issues.push(`adapterpaths count mismatch ${adapterpaths.length}/${frameworks.length}`);
}

if (uniq(adapterpaths).length !== adapterpaths.length) {
	issues.push("adapterpaths contains duplicates");
}

if (adapters.length !== frameworks.length) {
	issues.push(`adapters count mismatch ${adapters.length}/${frameworks.length}`);
}

const adapterfiles = adapters.map((item) => item.file);
if (uniq(adapterfiles).length !== adapterfiles.length) {
	issues.push("adapters contains duplicate files");
}

const adapternames = adapters.map((item) => item.name);
if (uniq(adapternames).length !== adapternames.length) {
	issues.push("adapters contains duplicate names");
}

const adapterkeys = adapters.map((item) => item.key);
if (uniq(adapterkeys).length !== adapterkeys.length) {
	issues.push("adapters contains duplicate keys");
}

for (const item of adapters) {
	if (!adapterpaths.includes(item.path)) {
		issues.push(`adapter missing adapterpath ${item.path}`);
	}
}

if (manuals.length !== frameworks.length) {
	issues.push(`manuals count mismatch ${manuals.length}/${frameworks.length}`);
}

const manualfiles = manuals.map((item) => item.file);
if (uniq(manualfiles).length !== manualfiles.length) {
	issues.push("manuals contains duplicate files");
}

for (const manual of manuals) {
	if (!manual.file.startsWith("docs/manual/") || !manual.file.endsWith(".mdx")) {
		issues.push(`manual file format invalid ${manual.file}`);
	}
	if (!manual.href.includes("/docs/manual/")) {
		issues.push(`manual href invalid ${manual.file}`);
	}
	if (!manual.card.includes('title="')) {
		issues.push(`manual card invalid ${manual.file}`);
	}
	if (!manual.install.startsWith("bun add ")) {
		issues.push(`manual install invalid ${manual.file}`);
	}
	try {
		await readFile(join(root, manual.file), "utf8");
	} catch {
		issues.push(`manual file missing ${manual.file}`);
	}
}

for (const path of adapterpaths) {
	const owners = manuals.filter((manual) => manual.tokens.includes(path));
	if (owners.length !== 1) {
		issues.push(`adapter path ${path} must appear in exactly one manual token list`);
	}
}

if (issues.length > 0) {
	console.error("x frameworkset contract validation failed");
	for (const issue of issues) {
		console.error(issue);
	}
	process.exit(1);
}

console.log(`o frameworkset contract validation passed (${frameworks.length} frameworks)`);
