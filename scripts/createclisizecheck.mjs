import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const file = join(process.cwd(), "packages", "create-fromsrc", "dist", "index.js");
const max = 26000;
const maxgzip = 9000;

const output = await readFile(file);
const size = output.byteLength;
const gzipsize = gzipSync(output).byteLength;
const line = `createcli: ${size}b gzip:${gzipsize}b (max ${max}b / ${maxgzip}b)`;

if (size > max || gzipsize > maxgzip) {
	console.error(`x ${line}`);
	process.exit(1);
}

console.log(`o ${line}`);
