import type { ComponentType } from "react"

export type MdxComponent = ComponentType<any>

export type MdxScope = Record<string, MdxComponent>

export type MdxScopeConfig = {
	defaults?: MdxScope
	overrides?: MdxScope
	aliases?: Record<string, string>
}

export function createScope(config?: MdxScopeConfig): MdxScope {
	if (!config) return {}
	const base = { ...config.defaults }
	if (config.overrides) {
		for (const [key, value] of Object.entries(config.overrides)) {
			base[key] = value
		}
	}
	if (config.aliases) {
		for (const [alias, target] of Object.entries(config.aliases)) {
			const component = base[target]
			if (component) {
				base[alias] = component
			}
		}
	}
	return base
}

export function mergeScopes(...scopes: MdxScope[]): MdxScope {
	const result: MdxScope = {}
	for (const scope of scopes) {
		for (const [key, value] of Object.entries(scope)) {
			result[key] = value
		}
	}
	return result
}

export function withDefaults(scope: MdxScope, defaults: MdxScope): MdxScope {
	const result = { ...defaults }
	for (const [key, value] of Object.entries(scope)) {
		result[key] = value
	}
	return result
}

export function filterScope(scope: MdxScope, allowed: string[]): MdxScope {
	const set = new Set(allowed)
	const result: MdxScope = {}
	for (const [key, value] of Object.entries(scope)) {
		if (set.has(key)) {
			result[key] = value
		}
	}
	return result
}

export function scopeFromImports(imports: Record<string, any>): MdxScope {
	const result: MdxScope = {}
	for (const [key, value] of Object.entries(imports)) {
		if (/^[A-Z]/.test(key) && typeof value === "function") {
			result[key] = value as MdxComponent
		}
	}
	return result
}

export function listComponents(scope: MdxScope): string[] {
	return Object.keys(scope).sort()
}
