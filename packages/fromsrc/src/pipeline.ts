type Transformer = (content: string, metadata: Record<string, unknown>) => string | Promise<string>

export function createPipeline(...transformers: Transformer[]) {
	const list = [...transformers]

	return {
		async transform(content: string, metadata: Record<string, unknown> = {}): Promise<string> {
			let result = content
			for (const t of list) {
				result = await t(result, metadata)
			}
			return result
		},
		add(transformer: Transformer) {
			list.push(transformer)
		},
	}
}

export function stripFrontmatter(): Transformer {
	return (content) => content.replace(/^---\n[\s\S]*?\n---\n/, "")
}

export function stripImports(): Transformer {
	return (content) => content.replace(/^import\s+.*?from\s+['"][^'"]+['"];?\n?/gm, "")
}

export function stripExports(): Transformer {
	return (content) => content.replace(/^export\s+.*?\n/gm, "")
}

export function stripJsx(): Transformer {
	return (content) =>
		content
			.replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, "")
			.replace(/<[A-Z][^>]*\/>/g, "")
}

export function normalizeWhitespace(): Transformer {
	return (content) => content.replace(/\n{3,}/g, "\n\n")
}

export function addBaseUrl(base: string): Transformer {
	const normalized = base.endsWith("/") ? base.slice(0, -1) : base
	return (content) => content.replace(/\]\(\//g, `](${normalized}/`)
}

export function toPlaintext() {
	return createPipeline(
		stripFrontmatter(),
		stripImports(),
		stripExports(),
		stripJsx(),
		(content) =>
			content
				.replace(/^#{1,6}\s+/gm, "")
				.replace(/\*\*([^*]+)\*\*/g, "$1")
				.replace(/\*([^*]+)\*/g, "$1")
				.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
				.replace(/`([^`]+)`/g, "$1"),
		normalizeWhitespace(),
	)
}

export type { Transformer }
