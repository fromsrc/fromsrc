import { promises as fs } from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const src = path.join(root, "packages", "fromsrc", "src");

const entries = [
	"readtime.ts",
	"searchscore.ts",
	"searchindex.ts",
	"llms.ts",
	"openapi.ts",
	"algolia.ts",
	"orama.ts",
];

const blocked = [
	"react",
	"react-dom",
	"next",
	"next-mdx-remote",
	"@mdx-js/mdx",
	"shiki",
	"katex",
	"lucide-react",
];

const localcache = new Map();
const externalcache = new Map();
const issues = new Set();

function addissue(file, target, entry) {
	issues.add(`${path.relative(root, file)} -> ${target} (entry: ${entry})`);
}

function parseimports(text) {
	const targets = [];
	const source = ts.createSourceFile("input.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	function visit(node) {
		if (ts.isImportDeclaration(node)) {
			const target = literal(node.moduleSpecifier);
			if (target && !importistype(node.importClause)) targets.push(target);
		}
		if (ts.isExportDeclaration(node)) {
			const target = node.moduleSpecifier ? literal(node.moduleSpecifier) : null;
			if (target && !node.isTypeOnly) targets.push(target);
		}
		if (ts.isCallExpression(node)) {
			if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
				const target = node.arguments[0] ? literal(node.arguments[0]) : null;
				if (target) targets.push(target);
			}
			if (ts.isIdentifier(node.expression) && node.expression.text === "require") {
				const target = node.arguments[0] ? literal(node.arguments[0]) : null;
				if (target) targets.push(target);
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(source);
	return targets;
}

function literal(node) {
	return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ? node.text : null;
}

function importistype(clause) {
	if (!clause) return false;
	if (clause.isTypeOnly) return true;
	const named = clause.namedBindings;
	if (!named || !ts.isNamedImports(named) || clause.name) return false;
	if (named.elements.length === 0) return false;
	for (const item of named.elements) {
		if (!item.isTypeOnly) return false;
	}
	return true;
}

function isblocked(target) {
	if (target.endsWith(".css")) return true;
	for (const item of blocked) {
		if (target === item || target.startsWith(`${item}/`)) return true;
	}
	return false;
}

async function fileexists(file) {
	try {
		await fs.access(file);
		return true;
	} catch {
		return false;
	}
}

async function resolvelocal(base, target) {
	const key = `${base}|${target}`;
	if (localcache.has(key)) return localcache.get(key);
	const basepath = path.resolve(path.dirname(base), target);
	const options = [
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
	for (const option of options) {
		if (await fileexists(option)) {
			localcache.set(key, option);
			return option;
		}
	}
	localcache.set(key, null);
	return null;
}

async function scanfile(file, entry, stack) {
	if (stack.has(file)) return;
	stack.add(file);
	if (file.endsWith(".css")) {
		addissue(file, "css side effect", entry);
		stack.delete(file);
		return;
	}
	let imports = externalcache.get(file);
	if (!imports) {
		const text = await fs.readFile(file, "utf8");
		const trimmed = text.trimStart();
		if (trimmed.startsWith("\"use client\"") || trimmed.startsWith("'use client'")) {
			addissue(file, "use client directive", entry);
		}
		imports = parseimports(text);
		externalcache.set(file, imports);
	}
	for (const target of imports) {
		if (!target) continue;
		if (isblocked(target)) {
			addissue(file, target, entry);
			continue;
		}
		if (target.startsWith(".") || target.startsWith("/")) {
			const resolved = await resolvelocal(file, target);
			if (!resolved) {
				addissue(file, `${target} (unresolved)`, entry);
				continue;
			}
			await scanfile(resolved, entry, stack);
		}
	}
	stack.delete(file);
}

for (const name of entries) {
	const file = path.join(src, name);
	await scanfile(file, name, new Set());
}

if (issues.size > 0) {
	console.error("x lightweight entrypoint dependency violations:");
	for (const issue of Array.from(issues).sort()) console.error(issue);
	process.exit(1);
}

console.log(`o lightweight entrypoint dependencies validated (${entries.length} files)`);
