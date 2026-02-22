import { adapterpaths } from "./frameworkset.mjs";
import { clientkeys, entryfiles, entrymap } from "./entryset.mjs";

const issues = [];

const expectedframeworkkeys = adapterpaths.map((path) => `./${path.replace("fromsrc/", "")}`);

for (const key of expectedframeworkkeys) {
	if (!entrymap.has(key)) {
		issues.push(`entrymap missing framework key ${key}`);
	}
	if (!clientkeys.includes(key)) {
		issues.push(`clientkeys missing framework key ${key}`);
	}
}

if (!entrymap.has("./client")) {
	issues.push("entrymap missing ./client");
}

if (!clientkeys.includes("./client")) {
	issues.push("clientkeys missing ./client");
}

const uniquefiles = [...new Set(entryfiles)];
if (uniquefiles.length !== entryfiles.length) {
	issues.push("entryfiles contains duplicates");
}

for (const file of entryfiles) {
	if (!file.endsWith(".ts")) {
		issues.push(`entryfile must end with .ts: ${file}`);
	}
}

const uniqueclient = [...new Set(clientkeys)];
if (uniqueclient.length !== clientkeys.length) {
	issues.push("clientkeys contains duplicates");
}

for (const key of clientkeys) {
	if (!entrymap.has(key)) {
		issues.push(`clientkeys references missing entrymap key ${key}`);
	}
}

if (issues.length > 0) {
	console.error("x entryset contract validation failed");
	for (const issue of issues) {
		console.error(issue);
	}
	process.exit(1);
}

console.log(`o entryset contract validation passed (${entrymap.size} entries)`);
