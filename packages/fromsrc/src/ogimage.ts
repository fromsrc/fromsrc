export interface OgImageConfig {
  title: string;
  description?: string;
  siteName?: string;
  logo?: string;
  theme?: "light" | "dark";
  accentColor?: string;
  width?: number;
  height?: number;
}

export interface OgImageMeta {
  url: string;
  width: number;
  height: number;
  alt: string;
  type: string;
}

export function ogImageUrl(
  base: string,
  params: Record<string, string | undefined>
): string {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export function generateOgMeta(
  base: string,
  config: OgImageConfig
): OgImageMeta {
  const width = config.width ?? 1200;
  const height = config.height ?? 630;
  const url = ogImageUrl(base, {
    accentColor: config.accentColor,
    description: config.description,
    height: String(height),
    logo: config.logo,
    siteName: config.siteName,
    theme: config.theme,
    title: config.title,
    width: String(width),
  });
  return {
    alt: config.description ?? config.title,
    height,
    type: "image/png",
    url,
    width,
  };
}

export function defaultTemplate(config: OgImageConfig) {
  const dark = config.theme === "dark";
  return {
    colors: {
      accent: config.accentColor ?? (dark ? "#3b82f6" : "#2563eb"),
      background: dark ? "#0a0a0a" : "#ffffff",
      foreground: dark ? "#fafafa" : "#0a0a0a",
      muted: dark ? "#a1a1aa" : "#71717a",
    },
    description: config.description ?? "",
    height: config.height ?? 630,
    logo: config.logo ?? "",
    siteName: config.siteName ?? "",
    title: config.title,
    width: config.width ?? 1200,
  };
}

type MetaTag =
  | { property: string; content: string }
  | { name: string; content: string };

export function socialMeta(config: OgImageConfig & { url: string }): MetaTag[] {
  const width = config.width ?? 1200;
  const height = config.height ?? 630;
  const alt = config.description ?? config.title;
  return [
    { content: config.url, property: "og:image" },
    { content: String(width), property: "og:image:width" },
    { content: String(height), property: "og:image:height" },
    { content: alt, property: "og:image:alt" },
    { content: "summary_large_image", name: "twitter:card" },
    { content: config.url, name: "twitter:image" },
  ];
}
