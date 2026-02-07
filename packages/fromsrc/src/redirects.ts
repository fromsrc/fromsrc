export interface Redirect {
	source: string
	destination: string
	permanent?: boolean
}

export interface RedirectConfig {
	redirects: Redirect[]
}

function compile(source: string): { regex: RegExp; keys: string[] } {
	const keys: string[] = []
	const pattern = source
		.replace(/\/\*/g, () => {
			keys.push("*")
			return "/(.*)"
		})
		.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
			keys.push(key)
			return "([^/]+)"
		})
	return { regex: new RegExp(`^${pattern}/?$`), keys }
}

function substitute(destination: string, params: Record<string, string>): string {
	let result = destination
	for (const [key, value] of Object.entries(params)) {
		if (key === "*") {
			result = result.replace("*", value)
		} else {
			result = result.replace(`:${key}`, value)
		}
	}
	return result
}

export function createRedirects(config: RedirectConfig) {
	const compiled = config.redirects.map((r) => ({
		...r,
		...compile(r.source),
	}))

	function match(pathname: string): { destination: string; permanent: boolean } | null {
		const normalized = pathname === "" ? "/" : pathname
		for (const entry of compiled) {
			const m = normalized.match(entry.regex)
			if (!m) continue
			const params: Record<string, string> = {}
			for (let i = 0; i < entry.keys.length; i++) {
				params[entry.keys[i]!] = m[i + 1]!
			}
			return {
				destination: substitute(entry.destination, params),
				permanent: entry.permanent !== false,
			}
		}
		return null
	}

	function toNextConfig() {
		return config.redirects.map((r) => ({
			source: r.source.replace("*", ":path*"),
			destination: r.destination.replace("*", ":path*"),
			permanent: r.permanent !== false,
		}))
	}

	function toVercelConfig() {
		return config.redirects.map((r) => ({
			source: r.source.replace("*", "(.*)").replace(/:([a-zA-Z0-9_]+)/g, "($1)"),
			destination: r.destination.replace("*", "$1").replace(/:([a-zA-Z0-9_]+)/g, "$1"),
			statusCode: r.permanent !== false ? 301 : 302,
		}))
	}

	return { match, toNextConfig, toVercelConfig }
}

export function parseRedirectsFile(content: string): Redirect[] {
	return content
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith("#"))
		.map((line) => {
			const parts = line.split(/\s+/)
			const redirect: Redirect = { source: parts[0]!, destination: parts[1]! }
			if (parts[2] === "302") redirect.permanent = false
			return redirect
		})
}
