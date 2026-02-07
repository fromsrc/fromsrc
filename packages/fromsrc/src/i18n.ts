export interface I18nConfig {
	locales: string[]
	defaultLocale: string
	strategy?: "subpath" | "domain"
}

export interface LocaleInfo {
	locale: string
	isDefault: boolean
	dir: "ltr" | "rtl"
}

export const rtlLocales = new Set(["ar", "he", "fa", "ur", "ps", "sd", "yi", "dv"])

export function getDirection(locale: string): "ltr" | "rtl" {
	const base = locale.split("-")[0] ?? locale
	return rtlLocales.has(base) ? "rtl" : "ltr"
}

export function createI18n(config: I18nConfig) {
	const { locales, defaultLocale } = config
	const localeSet = new Set(locales)

	function getLocale(pathname: string): string {
		const segments = pathname.replace(/^\//, "").split("/")
		const first = segments[0]
		if (first && localeSet.has(first)) return first
		return defaultLocale
	}

	function getLocalizedPath(path: string, locale: string): string {
		const clean = path.startsWith("/") ? path : `/${path}`
		if (locale === defaultLocale) return clean
		if (!localeSet.has(locale)) return clean
		return `/${locale}${clean}`
	}

	function stripLocale(pathname: string): string {
		const segments = pathname.replace(/^\//, "").split("/")
		const first = segments[0]
		if (first && localeSet.has(first) && first !== defaultLocale) {
			const rest = segments.slice(1).join("/")
			return `/${rest}`
		}
		if (first && first === defaultLocale) {
			const rest = segments.slice(1).join("/")
			return `/${rest}`
		}
		return pathname.startsWith("/") ? pathname : `/${pathname}`
	}

	function getLocaleInfo(locale: string): LocaleInfo {
		return {
			locale,
			isDefault: locale === defaultLocale,
			dir: getDirection(locale),
		}
	}

	function detectLocale(acceptLanguage: string): string {
		if (!acceptLanguage) return defaultLocale
		const entries = acceptLanguage
			.split(",")
			.map((part) => {
				const trimmed = part.trim()
				const [lang, ...params] = trimmed.split(";")
				const qParam = params.find((p) => p.trim().startsWith("q="))
				const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1
				return { lang: (lang ?? "").trim(), q: Number.isNaN(q) ? 0 : q }
			})
			.sort((a, b) => b.q - a.q)

		for (const entry of entries) {
			const lang = entry.lang ?? ""
			if (localeSet.has(lang)) return lang
			const prefix = lang.split("-")[0] ?? ""
			if (prefix && localeSet.has(prefix)) return prefix
		}
		return defaultLocale
	}

	return {
		locales,
		defaultLocale,
		getLocale,
		getLocalizedPath,
		stripLocale,
		getLocaleInfo,
		detectLocale,
	}
}
