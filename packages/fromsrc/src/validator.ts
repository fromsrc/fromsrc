export type ValidationIssue = {
	rule: string
	message: string
	line?: number
	severity: "error" | "warning" | "info"
}

export type ValidationRule = {
	name: string
	check: (content: string, path: string) => ValidationIssue[]
}

export type ValidationResult = { path: string; issues: ValidationIssue[]; valid: boolean }

export type ValidatorConfig = { rules: ValidationRule[]; failOn?: "error" | "warning" }

export function createRule(
	name: string,
	check: (content: string, path: string) => ValidationIssue[],
): ValidationRule {
	return { name, check }
}

export function validate(
	content: string,
	path: string,
	rules: ValidationRule[],
): ValidationResult {
	const issues = rules.flatMap((r) => r.check(content, path))
	return { path, issues, valid: !issues.some((i) => i.severity === "error") }
}

export function validateAll(
	files: { path: string; content: string }[],
	rules: ValidationRule[],
): ValidationResult[] {
	return files.map((f) => validate(f.content, f.path, rules))
}

function scan(
	content: string,
	rule: string,
	severity: ValidationIssue["severity"],
	test: (line: string) => boolean,
	message: string,
): ValidationIssue[] {
	const issues: ValidationIssue[] = []
	const lines = content.split("\n")
	for (let i = 0; i < lines.length; i++) {
		if (test(lines[i]!)) issues.push({ rule, message, line: i + 1, severity })
	}
	return issues
}

export const builtinRules = {
	titleRequired: createRule("titleRequired", (content) => {
		const first = content.split("\n").find((l) => l.startsWith("#"))
		if (!first) return [{ rule: "titleRequired", message: "missing heading", severity: "error" }]
		return []
	}),
	maxLength: createRule("maxLength", (content) => {
		const count = content.split("\n").length
		if (count > 500)
			return [{ rule: "maxLength", message: `${count} lines exceeds 500`, severity: "warning" }]
		return []
	}),
	noTabs: createRule("noTabs", (content) =>
		scan(content, "noTabs", "warning", (l) => l.replace(/^\t+/, "").includes("\t"), "tab in content"),
	),
	noTrailingSpaces: createRule("noTrailingSpaces", (content) =>
		scan(content, "noTrailingSpaces", "warning", (l) => /\s+$/.test(l), "trailing space"),
	),
	noEmptyLinks: createRule("noEmptyLinks", (content) =>
		scan(content, "noEmptyLinks", "error", (l) => /\[.+?\]\(\s*\)/.test(l), "empty href"),
	),
	frontmatterRequired: createRule("frontmatterRequired", (content) => {
		if (!content.startsWith("---"))
			return [{ rule: "frontmatterRequired", message: "missing frontmatter", severity: "error" }]
		if (content.indexOf("---", 3) === -1)
			return [{ rule: "frontmatterRequired", message: "unclosed frontmatter", severity: "error" }]
		return []
	}),
} as const
