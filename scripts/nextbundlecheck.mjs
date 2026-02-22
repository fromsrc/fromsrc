import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const root = process.cwd();

const targets = [
	{
		name: "home",
		manifest: join(root, ".next", "server", "app", "page_client-reference-manifest.js"),
		route: "[project]/app/page",
		max: 30000,
		maxgzip: 9000,
	},
	{
		name: "docs",
		manifest: join(root, ".next", "server", "app", "docs", "[[...slug]]", "page_client-reference-manifest.js"),
		route: "[project]/app/docs/[[...slug]]/page",
		max: 380000,
		maxgzip: 100000,
	},
];

function parsemanifest(text) {
	const index = text.indexOf("= {");
	if (index < 0) throw new Error("manifest payload missing");
	const json = text.slice(index + 2).trim();
	return JSON.parse(json);
}

let fail = false;

for (const target of targets) {
	let manifest;
	try {
		const text = await readFile(target.manifest, "utf8");
		manifest = parsemanifest(text);
	} catch {
		fail = true;
		console.error(`x ${target.name}: manifest missing`);
		continue;
	}

	const map = manifest.entryJSFiles ?? {};
	const files = map[target.route];
	if (!Array.isArray(files)) {
		fail = true;
		console.error(`x ${target.name}: route chunks missing (${target.route})`);
		continue;
	}

	const unique = [...new Set(files)];
	let raw = 0;
	let zipped = 0;

	for (const file of unique) {
		try {
			const output = await readFile(join(root, ".next", file));
			raw += output.byteLength;
			zipped += gzipSync(output).byteLength;
		} catch {
			fail = true;
			console.error(`x ${target.name}: chunk missing (${file})`);
		}
	}

	const line = `${target.name}: ${raw}b gzip:${zipped}b (max ${target.max}b / ${target.maxgzip}b)`;
	if (raw > target.max || zipped > target.maxgzip) {
		fail = true;
		console.error(`x ${line}`);
	} else {
		console.log(`o ${line}`);
	}
}

if (fail) process.exit(1);
