import { readFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { external, list } from "./sizeset.mjs";

const raw = await readFile(new URL("./sizebaseline.json", import.meta.url), "utf8");
const base = JSON.parse(raw);
const root = await mkdtemp(join(process.cwd(), ".sizedelta-"));
let fail = false;

for (const item of list) {
	if (!base[item.name]) {
		console.error(`x missing baseline: ${item.name}`);
		fail = true;
	}
}

try {
	for (const item of list) {
		const mark = base[item.name];
		if (!mark) {
			continue;
		}
		const file = join(root, `${item.name}.ts`);
		await writeFile(file, item.code, "utf8");
		const res = await Bun.build({
			entrypoints: [file],
			root: process.cwd(),
			format: "esm",
			target: "browser",
			minify: true,
			treeShaking: true,
			external,
			write: false,
		});
		if (!res.success) {
			for (const log of res.logs) {
				console.error(log.message);
			}
			throw new Error(`bundle failed: ${item.name}`);
		}
		const out = res.outputs.find((entry) => entry.path.endsWith(".js"));
		if (!out) {
			throw new Error(`missing output: ${item.name}`);
		}
		const size = out.size;
		const text = await out.text();
		const gzip = gzipSync(Buffer.from(text, "utf8")).byteLength;
		const grow = size - mark.size;
		const growgzip = gzip - mark.gzip;
		const limit =
			mark.size < 2000 ? Math.max(Math.ceil(mark.size * 0.08), 120) : Math.max(Math.ceil(mark.size * 0.08), 700);
		const limitgzip =
			mark.gzip < 1000 ? Math.max(Math.ceil(mark.gzip * 0.08), 80) : Math.max(Math.ceil(mark.gzip * 0.08), 300);
		if (grow > limit || growgzip > limitgzip) {
			fail = true;
			console.error(
				`x ${item.name}: +${grow}b/+${growgzip}b exceeds +${limit}b/+${limitgzip}b baseline guard`,
			);
		} else {
			console.log(`o ${item.name}: +${grow}b/+${growgzip}b within +${limit}b/+${limitgzip}b`);
		}
	}
} finally {
	await rm(root, { recursive: true, force: true });
}

if (fail) {
	process.exit(1);
}
