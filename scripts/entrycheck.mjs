import { readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const src = path.join(root, "packages", "fromsrc", "src");

const entries = [
	"index.ts",
	"client.ts",
	"next.ts",
	"reactrouter.ts",
	"vite.ts",
	"tanstack.ts",
	"remix.ts",
	"astro.ts",
	"readtime.ts",
	"searchscore.ts",
	"searchindex.ts",
	"llms.ts",
	"openapi.ts",
	"algolia.ts",
	"orama.ts",
];

const issues = [];

function isdirective(node) {
	if (!ts.isExpressionStatement(node)) return false;
	if (!ts.isStringLiteral(node.expression)) return false;
	const value = node.expression.text;
	return value === "use client" || value === "use strict";
}

for (const entry of entries) {
	const file = path.join(src, entry);
	const text = await readFile(file, "utf8");
	const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	for (const node of source.statements) {
		if (ts.isExpressionStatement(node) && !isdirective(node)) {
			issues.push(`${path.relative(root, file)}: top-level side effect statement is not allowed`);
			continue;
		}
		if (ts.isExportAssignment(node)) {
			issues.push(`${path.relative(root, file)}: default export is not allowed`);
			continue;
		}
		if (ts.isExportDeclaration(node)) {
			if (!node.moduleSpecifier) continue;
			if (node.exportClause) continue;
			issues.push(`${path.relative(root, file)}: wildcard re-export is not allowed`);
		}
	}
}

if (issues.length > 0) {
	console.error("x public entry validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o public entry validation passed (${entries.length} files)`);
