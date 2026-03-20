export interface WebhookEvent {
  type: "created" | "updated" | "deleted";
  path: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface WebhookConfig {
  url: string;
  secret?: string;
  events?: WebhookEvent["type"][];
}

export interface WebhookResult {
  success: boolean;
  status: number;
  duration: number;
}

type jsonrecord = Record<string, unknown>;

function sign(secret: string, timestamp: number): string {
  return btoa(`${secret}${timestamp}`);
}

function isrecord(value: unknown): value is jsonrecord {
  return typeof value === "object" && value !== null;
}

function istype(value: unknown): value is WebhookEvent["type"] {
  return value === "created" || value === "updated" || value === "deleted";
}

function isevent(value: unknown): value is WebhookEvent {
  if (!isrecord(value)) {
    return false;
  }
  if (!istype(value.type)) {
    return false;
  }
  if (typeof value.path !== "string") {
    return false;
  }
  if (
    typeof value.timestamp !== "number" ||
    !Number.isFinite(value.timestamp)
  ) {
    return false;
  }
  if (value.metadata !== undefined && !isrecord(value.metadata)) {
    return false;
  }
  return true;
}

function parsets(payload: string): number | null {
  try {
    const raw: unknown = JSON.parse(payload);
    if (Array.isArray(raw)) {
      const first = raw[0];
      return isevent(first) ? first.timestamp : null;
    }
    return isevent(raw) ? raw.timestamp : null;
  } catch {
    return null;
  }
}

export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const ts = parsets(payload);
  if (ts === null) {
    return false;
  }
  return sign(secret, ts) === signature;
}

export function createEventFromChange(
  type: WebhookEvent["type"],
  path: string,
  meta?: Record<string, unknown>
): WebhookEvent {
  return { path, timestamp: Date.now(), type, ...(meta && { metadata: meta }) };
}

export function filterEvents(
  config: WebhookConfig,
  events: WebhookEvent[]
): WebhookEvent[] {
  const allowed = config.events;
  if (!allowed) {
    return events;
  }
  return events.filter((e) => allowed.includes(e.type));
}

async function dispatch(
  config: WebhookConfig,
  body: string,
  type: string
): Promise<WebhookResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Webhook-Event": type,
  };
  const ts = parsets(body) ?? 0;
  if (config.secret) {
    headers["X-Webhook-Signature"] = sign(config.secret, ts);
  }
  const start = performance.now();
  try {
    const res = await fetch(config.url, { body, headers, method: "POST" });
    return {
      duration: performance.now() - start,
      status: res.status,
      success: res.ok,
    };
  } catch {
    return { duration: performance.now() - start, status: 0, success: false };
  }
}

export function createWebhook(config: WebhookConfig) {
  return {
    send: (event: WebhookEvent) =>
      dispatch(config, JSON.stringify(event), event.type),
    sendBatch: (events: WebhookEvent[]) =>
      dispatch(
        config,
        JSON.stringify(events),
        events.map((e) => e.type).join(",")
      ),
  };
}
