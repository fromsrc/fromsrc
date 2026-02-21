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
const pkgPath = join(base, "node_modules", "next-mdx-remote", "package.json");
const mdxPath = join(base, "app", "docs", "_components", "mdx.tsx");
const min = { major: 6, minor: 0, patch: 0 };
let fail = false;

try {
	const pkgText = await readFile(pkgPath, "utf8");
	const pkg = JSON.parse(pkgText);
	const raw = typeof pkg.version === "string" ? pkg.version : "";
	const parsed = parse(raw);
	if (!parsed) {
		console.error(`x next-mdx-remote version is invalid: ${raw}`);
		fail = true;
	} else if (!gte(parsed, min)) {
		console.error(`x next-mdx-remote ${raw} is below 6.0.0`);
		fail = true;
	} else {
		console.log(`o next-mdx-remote ${raw} is patched`);
	}
} catch {
	console.error("x next-mdx-remote is not installed");
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
