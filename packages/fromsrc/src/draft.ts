/** Configuration for draft mode with secret-based tokens */
export interface DraftConfig {
  secret: string;
  cookieName?: string;
  maxAge?: number;
}

/** Current draft mode state including token and expiry */
export interface DraftInfo {
  enabled: boolean;
  token?: string;
  expires?: number;
}

/** Filter option for including or excluding draft content */
export interface DraftFilter {
  includeDrafts: boolean;
}

/** Create a draft mode handler with cookie-based token management */
export function createDraftMode(config: DraftConfig) {
  const cookieName = config.cookieName ?? "fromsrc-preview";
  const maxAge = config.maxAge ?? 3600;

  function enable(token: string) {
    if (!validateToken(token)) {
      throw new Error("invalid token");
    }
    return { cookie: cookieName, maxAge, value: token };
  }

  function disable() {
    return { cookie: cookieName, maxAge: 0, value: "" };
  }

  function check(cookieValue: string | undefined): DraftInfo {
    if (!cookieValue) {
      return { enabled: false };
    }
    if (!validateToken(cookieValue)) {
      return { enabled: false };
    }
    const decoded = atob(cookieValue);
    const timestamp = Number(decoded.slice(config.secret.length + 1));
    return {
      enabled: true,
      expires: timestamp + maxAge * 1000,
      token: cookieValue,
    };
  }

  function generateToken(): string {
    const timestamp = Date.now();
    return btoa(`${config.secret}:${timestamp}`);
  }

  function validateToken(token: string): boolean {
    try {
      const decoded = atob(token);
      return decoded.startsWith(`${config.secret}:`);
    } catch {
      return false;
    }
  }

  return { check, disable, enable, generateToken, validateToken };
}

/** Remove draft items from a list unless drafts are included */
export function filterDrafts<T>(
  items: T[],
  key: keyof T,
  filter: DraftFilter
): T[] {
  if (filter.includeDrafts) {
    return items;
  }
  return items.filter((item) => !item[key]);
}

/** Check if frontmatter has draft set to true */
export function isDraft(frontmatter: Record<string, unknown>): boolean {
  return frontmatter.draft === true;
}

/** Check if content has a future publishDate and should remain a draft */
export function scheduledDraft(frontmatter: Record<string, unknown>): boolean {
  const { publishDate } = frontmatter;
  if (!publishDate) {
    return false;
  }
  if (
    typeof publishDate !== "string" &&
    typeof publishDate !== "number" &&
    !(publishDate instanceof Date)
  ) {
    return false;
  }
  const date = new Date(publishDate);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return date.getTime() > Date.now();
}
