import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const logfile = join(root, ".dev.log");

const rawcount = process.argv[2] || "80";
const count = Number(rawcount);
const size = Number.isFinite(count) && count > 0 ? Math.floor(count) : 80;

try {
	const text = await readFile(logfile, "utf8");
	const lines = text.split("\n");
	const tail = lines.slice(-size);
	for (const line of tail) {
		if (line.length > 0) console.log(line);
	}
} catch {
	console.log("o no log");
}
