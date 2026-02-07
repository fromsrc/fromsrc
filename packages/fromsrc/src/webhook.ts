export type WebhookEvent = {
	type: "created" | "updated" | "deleted"
	path: string
	timestamp: number
	metadata?: Record<string, unknown>
}

export type WebhookConfig = {
	url: string
	secret?: string
	events?: WebhookEvent["type"][]
}

export type WebhookResult = {
	success: boolean
	status: number
	duration: number
}

function sign(secret: string, timestamp: number): string {
	return btoa(`${secret}${timestamp}`)
}

export function verifySignature(payload: string, signature: string, secret: string): boolean {
	const event = JSON.parse(payload) as WebhookEvent | WebhookEvent[]
	const ts = Array.isArray(event) ? event[0]?.timestamp ?? 0 : event.timestamp
	return sign(secret, ts) === signature
}

export function createEventFromChange(
	type: WebhookEvent["type"],
	path: string,
	meta?: Record<string, unknown>,
): WebhookEvent {
	return { type, path, timestamp: Date.now(), ...(meta && { metadata: meta }) }
}

export function filterEvents(config: WebhookConfig, events: WebhookEvent[]): WebhookEvent[] {
	if (!config.events) return events
	return events.filter((e) => config.events!.includes(e.type))
}

async function dispatch(config: WebhookConfig, body: string, type: string): Promise<WebhookResult> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		"X-Webhook-Event": type,
	}
	const parsed = JSON.parse(body) as WebhookEvent | WebhookEvent[]
	const ts = Array.isArray(parsed) ? parsed[0]?.timestamp ?? 0 : parsed.timestamp
	if (config.secret) {
		headers["X-Webhook-Signature"] = sign(config.secret, ts)
	}
	const start = performance.now()
	try {
		const res = await fetch(config.url, { method: "POST", headers, body })
		return { success: res.ok, status: res.status, duration: performance.now() - start }
	} catch {
		return { success: false, status: 0, duration: performance.now() - start }
	}
}

export function createWebhook(config: WebhookConfig) {
	return {
		send: (event: WebhookEvent) => dispatch(config, JSON.stringify(event), event.type),
		sendBatch: (events: WebhookEvent[]) =>
			dispatch(config, JSON.stringify(events), events.map((e) => e.type).join(",")),
	}
}
