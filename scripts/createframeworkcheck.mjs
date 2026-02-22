import { aliases, frameworks, parseframework } from "../packages/create-fromsrc/src/frameworks";
import { frameworks as sharedframeworks } from "./frameworkset.mjs";

const issues = [];

if (frameworks.length === 0) {
	issues.push("frameworks list is empty");
}

if (frameworks[0] !== "next.js") {
	issues.push("frameworks default must be next.js");
}

const uniqueframeworks = [...new Set(frameworks)];
if (uniqueframeworks.length !== frameworks.length) {
	issues.push("frameworks contains duplicates");
}

const missingfromshared = sharedframeworks.filter((name) => !frameworks.includes(name));
const extraincreate = frameworks.filter((name) => !sharedframeworks.includes(name));
for (const name of missingfromshared) {
	issues.push(`framework missing in create-fromsrc: ${name}`);
}
for (const name of extraincreate) {
	issues.push(`unexpected create-fromsrc framework: ${name}`);
}

const aliaskeys = Object.keys(aliases);
if (aliaskeys.length === 0) {
	issues.push("aliases is empty");
}

const requiredaliases = ["next", "nextjs", "rr", "router", "reactrouter", "ts", "tanstackstart"];
for (const key of requiredaliases) {
	if (!(key in aliases)) {
		issues.push(`missing alias key ${key}`);
	}
}

for (const key of aliaskeys) {
	if (!/^[a-z0-9]+$/.test(key)) {
		issues.push(`alias key must be lowercase alnum: ${key}`);
	}
	const value = aliases[key];
	if (!frameworks.includes(value)) {
		issues.push(`alias points to unknown framework: ${key} -> ${value}`);
	}
	const parsed = parseframework(key);
	if (parsed !== value) {
		issues.push(`parseframework failed alias ${key}`);
	}
}

for (const name of frameworks) {
	if (parseframework(name) !== name) {
		issues.push(`parseframework failed canonical ${name}`);
	}
	if (parseframework(name.toUpperCase()) !== name) {
		issues.push(`parseframework failed case fold ${name}`);
	}
}

if (parseframework(undefined) !== undefined) {
	issues.push("parseframework(undefined) must be undefined");
}

if (parseframework("unknown-framework") !== undefined) {
	issues.push("parseframework must reject invalid framework");
}

if (issues.length > 0) {
	console.error("x create framework contract validation failed");
	for (const issue of issues) {
		console.error(issue);
	}
	process.exit(1);
}

console.log(`o create framework contract validation passed (${frameworks.length} frameworks)`);
