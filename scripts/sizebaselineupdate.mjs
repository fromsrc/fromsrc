import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { external, list } from "./sizeset.mjs";

const root = await mkdtemp(join(process.cwd(), ".sizebase-"));
const next = {};

try {
	for (const item of list) {
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
		const text = await out.text();
		next[item.name] = {
			size: out.size,
			gzip: gzipSync(Buffer.from(text, "utf8")).byteLength,
		};
		console.log(`o ${item.name}: ${next[item.name].size}b gzip:${next[item.name].gzip}b`);
	}
} finally {
	await rm(root, { recursive: true, force: true });
}

const out = `${JSON.stringify(next, null, "\t")}\n`;
await writeFile(new URL("./sizebaseline.json", import.meta.url), out, "utf8");
console.log(`o updated sizebaseline.json (${list.length} entries)`);
