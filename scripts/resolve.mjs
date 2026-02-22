import { stat } from "node:fs/promises";
import path from "node:path";

async function isfile(file) {
	try {
		const data = await stat(file);
		return data.isFile();
	} catch {
		return false;
	}
}

function options(basepath) {
	return [
		basepath,
		`${basepath}.ts`,
		`${basepath}.tsx`,
		`${basepath}.mts`,
		`${basepath}.cts`,
		`${basepath}.js`,
		`${basepath}.mjs`,
		`${basepath}.cjs`,
		path.join(basepath, "index.ts"),
		path.join(basepath, "index.tsx"),
		path.join(basepath, "index.js"),
		path.join(basepath, "index.mjs"),
		path.join(basepath, "index.cjs"),
	];
}

export function createresolver() {
	const cache = new Map();
	return async function resolve(base, target) {
		const key = `${base}|${target}`;
		if (cache.has(key)) return cache.get(key);
		const basepath = path.resolve(path.dirname(base), target);
		for (const option of options(basepath)) {
			if (await isfile(option)) {
				cache.set(key, option);
				return option;
			}
		}
		cache.set(key, null);
		return null;
	};
}
