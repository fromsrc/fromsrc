import { readFile } from "node:fs/promises";
import { join } from "node:path";

function parse(version) {
	const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
	if (!match) return null;
	return {
		major: Number(match[1]),
		minor: Number(match[2]),
		patch: Number(match[3]),
	};
}

function gte(left, right) {
	if (left.major !== right.major) return left.major > right.major;
	if (left.minor !== right.minor) return left.minor > right.minor;
	return left.patch >= right.patch;
}

const base = process.cwd();
const lockPath = join(base, "bun.lock");
const mdxPath = join(base, "app", "docs", "_components", "mdx.tsx");
const checks = [
	{
		name: "next-mdx-remote",
		file: join(base, "node_modules", "next-mdx-remote", "package.json"),
		min: { major: 6, minor: 0, patch: 0 },
	},
	{
		name: "react",
		file: join(base, "node_modules", "react", "package.json"),
		min: { major: 19, minor: 2, patch: 4 },
	},
	{
		name: "react-dom",
		file: join(base, "node_modules", "react-dom", "package.json"),
		min: { major: 19, minor: 2, patch: 4 },
	},
];
let fail = false;

function label(min) {
	return `${min.major}.${min.minor}.${min.patch}`;
}

async function checkpkg(name, file, min) {
	try {
		const text = await readFile(file, "utf8");
		const pkg = JSON.parse(text);
		const raw = typeof pkg.version === "string" ? pkg.version : "";
		const parsed = parse(raw);
		if (!parsed) {
			console.error(`x ${name} version is invalid: ${raw}`);
			fail = true;
			return;
		}
		if (!gte(parsed, min)) {
			console.error(`x ${name} ${raw} is below ${label(min)}`);
			fail = true;
			return;
		}
		console.log(`o ${name} ${raw} is patched`);
	} catch {
		console.error(`x ${name} is not installed`);
		fail = true;
	}
}

function checklock(name, min, locktext) {
	const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const pattern = new RegExp(`"${escaped}"\\s*:\\s*\\["${escaped}@(\\d+\\.\\d+\\.\\d+)"`);
	const match = locktext.match(pattern);
	const raw = match?.[1] ?? "";
	if (!raw) {
		console.error(`x ${name} lock entry missing`);
		fail = true;
		return;
	}
	const parsed = parse(raw);
	if (!parsed || !gte(parsed, min)) {
		console.error(`x bun.lock contains ${name} below ${label(min)}`);
		fail = true;
		return;
	}
	console.log(`o bun.lock ${name} entry is patched (${raw})`);
}

for (const item of checks) {
	await checkpkg(item.name, item.file, item.min);
}

try {
	const locktext = await readFile(lockPath, "utf8");
	for (const item of checks) {
		checklock(item.name, item.min, locktext);
	}
} catch {
	console.error("x bun.lock missing");
	fail = true;
}

try {
	const mdx = await readFile(mdxPath, "utf8");
	const hasDangerous = /blockDangerousJS:\s*true/.test(mdx);
	const hasBlockJsOff = /blockJS:\s*false/.test(mdx);
	const hasSlugImport = /rehypeSlug/.test(mdx);
	const hasSlugPlugin = /rehypePlugins:\s*\[[\s\S]*rehypeSlug/.test(mdx);
	if (!hasDangerous) {
		console.error("x blockDangerousJS is not set to true in docs mdx renderer");
		fail = true;
	} else {
		console.log("o blockDangerousJS remains true");
	}
	if (!hasBlockJsOff) {
		console.error("x blockJS is not set to false in docs mdx renderer");
		fail = true;
	} else {
		console.log("o blockJS remains false for trusted local docs");
	}
	if (!hasSlugImport || !hasSlugPlugin) {
		console.error("x rehypeSlug is missing from docs mdx pipeline");
		fail = true;
	} else {
		console.log("o rehypeSlug remains enabled for unique heading ids");
	}
} catch {
	console.error("x docs mdx renderer file missing");
	fail = true;
}

if (fail) process.exit(1);
