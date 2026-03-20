export interface ApiResponse<T> {
  data: T;
  status: number;
}
export interface ApiError {
  error: string;
  status: number;
}
export interface CorsConfig {
  origins?: string[];
  methods?: string[];
  headers?: string[];
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

const DEFAULT_METHODS = "GET, POST, PUT, DELETE, OPTIONS, PATCH";
const DEFAULT_HEADERS = "Content-Type, Authorization, X-Requested-With";
let corsWarned = false;

export function json<T>(
  data: T,
  status = 200,
  headers?: HeadersInit
): Response {
  const next = new Headers(headers);
  if (!next.has("Content-Type")) {
    next.set("Content-Type", "application/json");
  }
  return new Response(JSON.stringify(data), {
    headers: next,
    status,
  });
}

export function error(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

export function cors(config?: CorsConfig): Record<string, string> {
  if (
    !corsWarned &&
    process.env.NODE_ENV === "production" &&
    (!config?.origins || config.origins.length === 0)
  ) {
    corsWarned = true;
    console.warn("fromsrc cors is using wildcard origins in production");
  }
  const origin =
    config?.origins && config.origins.length > 0
      ? config.origins.join(", ")
      : "*";
  return {
    "Access-Control-Allow-Headers":
      config?.headers?.join(", ") ?? DEFAULT_HEADERS,
    "Access-Control-Allow-Methods":
      config?.methods?.join(", ") ?? DEFAULT_METHODS,
    "Access-Control-Allow-Origin": origin,
  };
}

export function withCors(response: Response, config?: CorsConfig): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(cors(config))) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export function cache(
  response: Response,
  maxAge: number,
  stale?: number
): Response {
  const headers = new Headers(response.headers);
  const staleAge = stale ?? maxAge;
  headers.set(
    "Cache-Control",
    `public, max-age=${maxAge}, stale-while-revalidate=${staleAge}`
  );
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export function rateLimiter(
  config: RateLimitConfig
): (key: string) => RateLimitResult {
  const windows = new Map<string, { count: number; resetAt: number }>();

  return (key: string): RateLimitResult => {
    const now = Date.now();
    for (const [item, value] of [...windows.entries()]) {
      if (now >= value.resetAt) {
        windows.delete(item);
      }
    }
    const entry = windows.get(key);

    if (!entry || now >= entry.resetAt) {
      const resetAt = now + config.windowMs;
      windows.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: config.maxRequests - 1, resetAt };
    }

    entry.count++;
    const allowed = entry.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entry.count);
    return { allowed, remaining, resetAt: entry.resetAt };
  };
}
