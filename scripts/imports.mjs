import ts from "typescript";

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

export function parseimports(text) {
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
