export type OembedData = {
	type: "video" | "rich" | "photo" | "link"
	title?: string
	html?: string
	width?: number
	height?: number
	thumbnail?: string
	provider?: string
}

export type OembedProvider = {
	name: string
	pattern: RegExp
	endpoint: string
}

export const providers: OembedProvider[] = [
	{
		name: "YouTube",
		pattern: /(?:youtube\.com\/watch|youtu\.be\/)/,
		endpoint: "https://www.youtube.com/oembed",
	},
	{
		name: "Vimeo",
		pattern: /vimeo\.com\//,
		endpoint: "https://vimeo.com/api/oembed.json",
	},
	{
		name: "Twitter",
		pattern: /(?:twitter\.com|x\.com)\//,
		endpoint: "https://publish.twitter.com/oembed",
	},
	{
		name: "CodePen",
		pattern: /codepen\.io\//,
		endpoint: "https://codepen.io/api/oembed",
	},
	{
		name: "CodeSandbox",
		pattern: /codesandbox\.io\//,
		endpoint: "https://codesandbox.io/oembed",
	},
]

function find(url: string): OembedProvider | undefined {
	return providers.find((p) => p.pattern.test(url))
}

export async function resolve(url: string): Promise<OembedData | null> {
	const provider = find(url)
	if (!provider) return null
	try {
		const endpoint = `${provider.endpoint}?url=${encodeURIComponent(url)}&format=json`
		const response = await fetch(endpoint)
		if (!response.ok) return null
		const data = await response.json()
		return {
			type: data.type ?? "link",
			title: data.title,
			html: data.html,
			width: data.width,
			height: data.height,
			thumbnail: data.thumbnail_url,
			provider: provider.name,
		}
	} catch {
		return null
	}
}

export async function resolveMany(urls: string[]): Promise<Map<string, OembedData | null>> {
	const entries = await Promise.all(urls.map(async (url) => [url, await resolve(url)] as const))
	return new Map(entries)
}

const urlPattern = /https?:\/\/[^\s)>\]]+/g

export function extractUrls(content: string): string[] {
	const matches = content.match(urlPattern) ?? []
	return matches.filter((url) => find(url))
}
