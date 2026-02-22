import { writeFile } from "node:fs/promises";
import { measureall } from "./nextbundlemeasure.mjs";

const next = await measureall();
for (const [name, mark] of Object.entries(next)) {
	console.log(`o ${name}: ${mark.size}b gzip:${mark.gzip}b`);
}

const out = `${JSON.stringify(next, null, "\t")}\n`;
await writeFile(new URL("./nextbundlebaseline.json", import.meta.url), out, "utf8");
console.log("o updated nextbundlebaseline.json");
