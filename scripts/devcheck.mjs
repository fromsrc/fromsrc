import { readFile } from "node:fs/promises";
import { join } from "node:path";

const file = join(process.cwd(), ".dev.log");

let log = "";
try {
	log = await readFile(file, "utf8");
} catch {
	console.log("o no dev log");
	process.exit(0);
}

const rows = log.split("\n");
const mark = rows.reduce((last, row, index) => (row.includes("✓ Ready") ? index : last), 0);
const tail = rows.slice(mark);

const checks = [
	/\bModule not found\b/i,
	/\bhydration\b/i,
	/\bTypeError\b/i,
	/\bReferenceError\b/i,
	/\bSyntaxError\b/i,
	/\bUnhandled Runtime Error\b/i,
	/\b⨯\b/,
];

const bad = tail.filter((row) => checks.some((check) => check.test(row))).slice(-20);

if (bad.length > 0) {
	console.error("x dev log check failed");
	for (const row of bad) console.error(row);
	process.exit(1);
}

console.log(`o dev log check passed (${tail.length} lines scanned)`);
