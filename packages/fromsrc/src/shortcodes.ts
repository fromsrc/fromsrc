import { readFileSync } from "node:fs"

export type ShortcodeDefinition = {
	name: string
	transform: (attrs: Record<string, string>, content?: string) => string
}

export type ShortcodeConfig = {
	definitions: ShortcodeDefinition[]
}

export function parseAttrs(tag: string): Record<string, string> {
	const attrs: Record<string, string> = {}
	const pattern = /(\w+)="([^"]*)"/g
	let match: RegExpExecArray | null
	while ((match = pattern.exec(tag)) !== null) {
		const key = match[1]
		const value = match[2]
		if (!key || value === undefined) continue
		attrs[key] = value
	}
	return attrs
}

export function registerShortcode(
	name: string,
	transform: (attrs: Record<string, string>, content?: string) => string,
): ShortcodeDefinition {
	return { name, transform }
}

export function processShortcodes(content: string, config: ShortcodeConfig): string {
	let result = content

	for (const def of config.definitions) {
		const block = new RegExp(
			`\\{\\{${def.name}([^}]*)\\}\\}([\\s\\S]*?)\\{\\{/${def.name}\\}\\}`,
			"g",
		)
		result = result.replace(block, (_, tag: string, inner: string) => {
			return def.transform(parseAttrs(tag), inner)
		})

		const inline = new RegExp(`\\{\\{${def.name}([^}]*)\\}\\}`, "g")
		result = result.replace(inline, (_, tag: string) => {
			return def.transform(parseAttrs(tag))
		})
	}

	return result
}

export const builtinShortcodes: ShortcodeDefinition[] = [
	registerShortcode("youtube", (attrs) => {
		return `<YouTube id="${attrs.id}" />`
	}),
	registerShortcode("note", (attrs, content) => {
		return `<Note type="${attrs.type}">${content ?? ""}</Note>`
	}),
	registerShortcode("badge", (attrs) => {
		return `<Badge>${attrs.text}</Badge>`
	}),
	registerShortcode("include", (attrs) => {
		try {
			return attrs.file ? readFileSync(attrs.file, "utf-8") : ""
		} catch {
			return ""
		}
	}),
]
