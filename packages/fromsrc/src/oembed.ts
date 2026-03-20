export interface OembedData {
  type: "video" | "rich" | "photo" | "link";
  title?: string;
  html?: string;
  width?: number;
  height?: number;
  thumbnail?: string;
  provider?: string;
}

export interface OembedProvider {
  name: string;
  pattern: RegExp;
  endpoint: string;
}

export const providers: OembedProvider[] = [
  {
    endpoint: "https://www.youtube.com/oembed",
    name: "YouTube",
    pattern: /(?:youtube\.com\/watch|youtu\.be\/)/,
  },
  {
    endpoint: "https://vimeo.com/api/oembed.json",
    name: "Vimeo",
    pattern: /vimeo\.com\//,
  },
  {
    endpoint: "https://publish.twitter.com/oembed",
    name: "Twitter",
    pattern: /(?:twitter\.com|x\.com)\//,
  },
  {
    endpoint: "https://codepen.io/api/oembed",
    name: "CodePen",
    pattern: /codepen\.io\//,
  },
  {
    endpoint: "https://codesandbox.io/oembed",
    name: "CodeSandbox",
    pattern: /codesandbox\.io\//,
  },
];

function find(url: string): OembedProvider | undefined {
  return providers.find((p) => p.pattern.test(url));
}

export async function resolve(url: string): Promise<OembedData | null> {
  const provider = find(url);
  if (!provider) {
    return null;
  }
  try {
    const endpoint = `${provider.endpoint}?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return {
      height: data.height,
      html: data.html,
      provider: provider.name,
      thumbnail: data.thumbnail_url,
      title: data.title,
      type: data.type ?? "link",
      width: data.width,
    };
  } catch {
    return null;
  }
}

export async function resolveMany(
  urls: string[]
): Promise<Map<string, OembedData | null>> {
  const entries = await Promise.all(
    urls.map(async (url) => [url, await resolve(url)] as const)
  );
  return new Map(entries);
}

const urlPattern = /https?:\/\/[^\s)>\]]+/g;

export function extractUrls(content: string): string[] {
  const matches = content.match(urlPattern) ?? [];
  return matches.filter((url) => find(url));
}
