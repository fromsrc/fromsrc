export interface I18nConfig {
	defaultLocale: string
	locales: string[]
	pathPrefix?: boolean
}

export interface LocalizedPath {
	locale: string
	path: string
	originalPath: string
}

export interface I18nResult {
	locale: string
	path: string
	alternates: { locale: string; path: string }[]
}

export function detectLocale(acceptLanguage: string, locales: string[], fallback: string): string {
	if (!acceptLanguage) return fallback
	const set = new Set(locales)
	const entries = acceptLanguage
		.split(",")
		.map((part) => {
			const [lang, ...params] = part.trim().split(";")
			const qp = params.find((p) => p.trim().startsWith("q="))
			const q = qp ? Number.parseFloat(qp.trim().slice(2)) : 1
			return { lang: (lang ?? "").trim().toLowerCase(), q: Number.isNaN(q) ? 0 : q }
		})
		.sort((a, b) => b.q - a.q)
	for (const { lang } of entries) {
		if (set.has(lang)) return lang
		const base = lang.split("-")[0]
		if (!base) continue
		if (set.has(base)) return base
	}
	return fallback
}

export function localizePath(path: string, locale: string, config: I18nConfig): string {
	const clean = path.startsWith("/") ? path : `/${path}`
	if (locale === config.defaultLocale && !config.pathPrefix) return clean
	return `/${locale}${clean === "/" ? "" : clean}`
}

export function delocalizePath(path: string, config: I18nConfig): LocalizedPath {
	const clean = path.startsWith("/") ? path : `/${path}`
	const segments = clean.replace(/^\//, "").split("/")
	const first = segments[0]
	if (first && config.locales.includes(first)) {
		const rest = segments.slice(1).join("/")
		return {
			locale: first,
			path: `/${rest}` || "/",
			originalPath: clean,
		}
	}
	return {
		locale: config.defaultLocale,
		path: clean,
		originalPath: clean,
	}
}

export function resolveContent(path: string, locale: string, config: I18nConfig): string[] {
	const clean = path.startsWith("/") ? path.slice(1) : path
	const paths: string[] = []
	if (locale !== config.defaultLocale) {
		paths.push(`${locale}/${clean}`)
	}
	paths.push(clean)
	if (locale !== config.defaultLocale) {
		paths.push(`${config.defaultLocale}/${clean}`)
	}
	return paths
}

export function generateAlternates(path: string, config: I18nConfig): I18nResult {
	const { locale, path: stripped } = delocalizePath(path, config)
	const alternates = config.locales
		.filter((l) => l !== locale)
		.map((l) => ({
			locale: l,
			path: localizePath(stripped, l, config),
		}))
	return {
		locale,
		path: localizePath(stripped, locale, config),
		alternates,
	}
}

export function createI18n(config: I18nConfig) {
	return {
		resolve: (path: string, locale: string) => resolveContent(path, locale, config),
		localize: (path: string, locale: string) => localizePath(path, locale, config),
		delocalize: (path: string) => delocalizePath(path, config),
	}
}
