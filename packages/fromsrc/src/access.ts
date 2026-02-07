export type AccessRule = {
	pattern: string
	roles: string[]
	redirect?: string
}

export type AccessConfig = {
	rules: AccessRule[]
	defaultAccess?: "public" | "private"
}

export type AccessResult = {
	allowed: boolean
	redirect?: string
	requiredRoles?: string[]
}

export function matchPattern(pattern: string, path: string): boolean {
	const parts = pattern.split("/").filter(Boolean)
	const segments = path.split("/").filter(Boolean)
	let pi = 0
	let si = 0
	while (pi < parts.length && si < segments.length) {
		if (parts[pi] === "**") {
			if (pi === parts.length - 1) return true
			pi++
			while (si < segments.length) {
				if (matchPattern(parts.slice(pi).join("/"), segments.slice(si).join("/")))
					return true
				si++
			}
			return false
		}
		if (parts[pi] !== "*" && parts[pi] !== segments[si]) return false
		pi++
		si++
	}
	return pi === parts.length && si === segments.length
}

export function mergeRoles(rules: AccessRule[], path: string): string[] {
	const roles = new Set<string>()
	for (const rule of rules) {
		if (matchPattern(rule.pattern, path)) {
			for (const role of rule.roles) roles.add(role)
		}
	}
	return [...roles]
}

export function createAccess(config: AccessConfig) {
	const rules = [...config.rules]
	const defaultAccess = config.defaultAccess ?? "public"

	function check(path: string, userRoles: string[]): AccessResult {
		const matching = rules.filter((r) => matchPattern(r.pattern, path))
		if (matching.length === 0) {
			return { allowed: defaultAccess === "public" }
		}
		const required = mergeRoles(matching, path)
		const allowed = required.some((r) => userRoles.includes(r))
		const redirect = matching.find((r) => r.redirect && !allowed)?.redirect
		return { allowed, redirect, requiredRoles: required }
	}

	function addRule(rule: AccessRule) {
		rules.push(rule)
	}

	function getRules(): AccessRule[] {
		return rules
	}

	return { check, addRule, getRules }
}
