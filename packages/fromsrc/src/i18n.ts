/** Configuration for internationalization routing */
export interface I18nConfig {
  defaultLocale: string;
  locales: string[];
  pathPrefix?: boolean;
}

/** Path with its detected locale and original form */
export interface LocalizedPath {
  locale: string;
  path: string;
  originalPath: string;
}

/** Resolved locale path with alternate language links */
export interface I18nResult {
  locale: string;
  path: string;
  alternates: { locale: string; path: string }[];
}

/** Detect the best locale from an Accept-Language header */
export function detectLocale(
  acceptLanguage: string,
  locales: string[],
  fallback: string
): string {
  if (!acceptLanguage) {
    return fallback;
  }
  const set = new Set(locales);
  const entries = acceptLanguage
    .split(",")
    .map((part) => {
      const [lang, ...params] = part.trim().split(";");
      const qp = params.find((p) => p.trim().startsWith("q="));
      const q = qp ? Number.parseFloat(qp.trim().slice(2)) : 1;
      return {
        lang: (lang ?? "").trim().toLowerCase(),
        q: Number.isNaN(q) ? 0 : q,
      };
    })
    .sort((a, b) => b.q - a.q);
  for (const { lang } of entries) {
    if (set.has(lang)) {
      return lang;
    }
    const base = lang.split("-")[0];
    if (!base) {
      continue;
    }
    if (set.has(base)) {
      return base;
    }
  }
  return fallback;
}

/** Prefix a path with a locale segment */
export function localizePath(
  path: string,
  locale: string,
  config: I18nConfig
): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === config.defaultLocale && !config.pathPrefix) {
    return clean;
  }
  return `/${locale}${clean === "/" ? "" : clean}`;
}

/** Strip the locale prefix from a path */
export function delocalizePath(
  path: string,
  config: I18nConfig
): LocalizedPath {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const segments = clean.replace(/^\//, "").split("/");
  const first = segments[0];
  if (first && config.locales.includes(first)) {
    const rest = segments.slice(1).join("/");
    return {
      locale: first,
      originalPath: clean,
      path: `/${rest}` || "/",
    };
  }
  return {
    locale: config.defaultLocale,
    originalPath: clean,
    path: clean,
  };
}

/** Resolve content file paths to check for a given locale */
export function resolveContent(
  path: string,
  locale: string,
  config: I18nConfig
): string[] {
  const clean = path.startsWith("/") ? path.slice(1) : path;
  const paths: string[] = [];
  if (locale !== config.defaultLocale) {
    paths.push(`${locale}/${clean}`);
  }
  paths.push(clean);
  if (locale !== config.defaultLocale) {
    paths.push(`${config.defaultLocale}/${clean}`);
  }
  return paths;
}

/** Generate alternate locale links for a given path */
export function generateAlternates(
  path: string,
  config: I18nConfig
): I18nResult {
  const { locale, path: stripped } = delocalizePath(path, config);
  const alternates = config.locales
    .filter((l) => l !== locale)
    .map((l) => ({
      locale: l,
      path: localizePath(stripped, l, config),
    }));
  return {
    alternates,
    locale,
    path: localizePath(stripped, locale, config),
  };
}

/** Create a bound i18n helper with localize, delocalize, and resolve */
export function createI18n(config: I18nConfig) {
  return {
    delocalize: (path: string) => delocalizePath(path, config),
    localize: (path: string, locale: string) =>
      localizePath(path, locale, config),
    resolve: (path: string, locale: string) =>
      resolveContent(path, locale, config),
  };
}
