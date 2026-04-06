/** Single redirect rule with source, destination, and permanence */
export interface Redirect {
  source: string;
  destination: string;
  permanent?: boolean;
}

/** Configuration containing a list of redirect rules */
export interface RedirectConfig {
  redirects: Redirect[];
}

function compile(source: string): { regex: RegExp; keys: string[] } {
  const keys: string[] = [];
  const pattern = source
    .replaceAll("/*", () => {
      keys.push("*");
      return "/(.*)";
    })
    .replaceAll(/:([a-zA-Z0-9_]+)/g, (_, key) => {
      keys.push(key);
      return "([^/]+)";
    });
  return { keys, regex: new RegExp(`^${pattern}/?$`) };
}

function substitute(
  destination: string,
  params: Record<string, string>
): string {
  let result = destination;
  for (const [key, value] of Object.entries(params)) {
    if (key === "*") {
      result = result.split("*").join(value);
    } else {
      result = result.split(`:${key}`).join(value);
    }
  }
  return result;
}

/** Create a redirect matcher with Next.js and Vercel config export */
export function createRedirects(config: RedirectConfig) {
  const compiled = config.redirects.map((r) => ({
    ...r,
    ...compile(r.source),
  }));

  function match(
    pathname: string
  ): { destination: string; permanent: boolean } | null {
    const normalized = pathname === "" ? "/" : pathname;
    for (const entry of compiled) {
      const m = normalized.match(entry.regex);
      if (!m) {
        continue;
      }
      const params: Record<string, string> = {};
      for (let i = 0; i < entry.keys.length; i++) {
        const key = entry.keys[i];
        const value = m[i + 1];
        if (!key || value === undefined) {
          continue;
        }
        params[key] = value;
      }
      return {
        destination: substitute(entry.destination, params),
        permanent: entry.permanent !== false,
      };
    }
    return null;
  }

  function toNextConfig() {
    return config.redirects.map((r) => ({
      destination: r.destination.replace("*", ":path*"),
      permanent: r.permanent !== false,
      source: r.source.replace("*", ":path*"),
    }));
  }

  function toVercelConfig() {
    return config.redirects.map((r) => ({
      destination: r.destination
        .replace("*", "$1")
        .replaceAll(/:([a-zA-Z0-9_]+)/g, "$1"),
      source: r.source
        .replace("*", "(.*)")
        .replaceAll(/:([a-zA-Z0-9_]+)/g, "($1)"),
      statusCode: r.permanent !== false ? 301 : 302,
    }));
  }

  return { match, toNextConfig, toVercelConfig };
}

/** Parse a plain-text redirects file into redirect rules */
export function parseRedirectsFile(content: string): Redirect[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const parts = line.split(/\s+/);
      const source = parts[0] ?? "";
      const destination = parts[1] ?? "";
      const redirect: Redirect = { destination, source };
      if (parts[2] === "302") {
        redirect.permanent = false;
      }
      return redirect;
    })
    .filter(
      (redirect) =>
        redirect.source.length > 0 && redirect.destination.length > 0
    );
}
