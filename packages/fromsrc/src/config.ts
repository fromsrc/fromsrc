import { readFile } from "node:fs/promises"
import { join } from "node:path"

export type FromsrcConfig = {
	title: string
	description?: string
	baseUrl?: string
	docsDir?: string
	outDir?: string
	theme?: string
	search?: { provider?: string; options?: Record<string, unknown> }
	sidebar?: { defaultOpen?: boolean; collapsible?: boolean }
	toc?: { minDepth?: number; maxDepth?: number }
	i18n?: { defaultLocale?: string; locales?: string[] }
	editUrl?: string
	lastUpdated?: boolean
	draft?: boolean
}

export type ResolvedConfig = Required<
	Pick<FromsrcConfig, "title" | "docsDir" | "outDir" | "theme" | "lastUpdated" | "draft">
> & {
	description: string
	baseUrl: string
	search: { provider: string; options: Record<string, unknown> }
	sidebar: { defaultOpen: boolean; collapsible: boolean }
	toc: { minDepth: number; maxDepth: number }
	i18n: { defaultLocale: string; locales: string[] }
	editUrl: string
}

const defaults: Omit<ResolvedConfig, "title"> = {
	description: "",
	baseUrl: "/",
	docsDir: "docs",
	outDir: ".fromsrc",
	theme: "default",
	search: { provider: "local", options: {} },
	sidebar: { defaultOpen: true, collapsible: true },
	toc: { minDepth: 2, maxDepth: 3 },
	i18n: { defaultLocale: "en", locales: ["en"] },
	editUrl: "",
	lastUpdated: false,
	draft: false,
}

export function defineConfig(config: FromsrcConfig): FromsrcConfig {
	return config
}

export function resolveConfig(config: FromsrcConfig): ResolvedConfig {
	return mergeConfig(
		defaults as Record<string, unknown>,
		config as Record<string, unknown>,
	) as ResolvedConfig
}

export async function loadConfig(dir: string): Promise<FromsrcConfig> {
	for (const name of ["fromsrc.config.ts", "fromsrc.config.js"]) {
		try {
			const mod = await import(join(dir, name))
			return mod.default ?? mod
		} catch {}
	}
	try {
		const raw = await readFile(join(dir, "fromsrc.config.json"), "utf-8")
		return JSON.parse(raw)
	} catch {}
	throw new Error("no config found")
}

export function mergeConfig(
	base: Record<string, unknown>,
	overrides: Record<string, unknown>,
): Record<string, unknown> {
	const result = { ...base }
	for (const key of Object.keys(overrides)) {
		const b = base[key]
		const o = overrides[key]
		if (b && o && typeof b === "object" && typeof o === "object" && !Array.isArray(o)) {
			result[key] = mergeConfig(b as Record<string, unknown>, o as Record<string, unknown>)
		} else if (o !== undefined) {
			result[key] = o
		}
	}
	return result
}
