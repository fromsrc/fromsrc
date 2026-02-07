export interface AnalyticsEvent {
	type: "pageview" | "search" | "feedback" | "click"
	path: string
	timestamp: number
	data?: Record<string, string>
}

export interface AnalyticsConfig {
	endpoint?: string
	sampleRate?: number
	respectDnt?: boolean
}

interface AnalyticsSummary {
	topPages: { path: string; views: number }[]
	searchTerms: { term: string; count: number }[]
	totalViews: number
}

export function createAnalytics(config?: AnalyticsConfig) {
	const queue: AnalyticsEvent[] = []
	const endpoint = config?.endpoint ?? "/api/analytics"
	const sampleRate = config?.sampleRate ?? 1
	const respectDnt = config?.respectDnt ?? true

	function track(event: Omit<AnalyticsEvent, "timestamp">) {
		if (respectDnt && typeof navigator !== "undefined" && navigator.doNotTrack === "1") return
		if (Math.random() > sampleRate) return
		queue.push({ ...event, timestamp: Date.now() })
	}

	async function flush() {
		if (queue.length === 0) return
		const batch = queue.splice(0, queue.length)
		try {
			await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(batch),
			})
		} catch {
			queue.unshift(...batch)
		}
	}

	function getQueue(): AnalyticsEvent[] {
		return [...queue]
	}

	return { track, flush, getQueue }
}

export function generateScript(config?: AnalyticsConfig): string {
	const ep = config?.endpoint ?? "/api/analytics"
	const sr = config?.sampleRate ?? 1
	const dnt = config?.respectDnt ?? true
	return `<script>(function(){${dnt ? 'if(navigator.doNotTrack==="1")return;' : ""}${sr < 1 ? `if(Math.random()>${sr})return;` : ""}var q=[],e="${ep}",p=location.pathname,h=history;function t(){q.push({type:"pageview",path:location.pathname,timestamp:+new Date})}function s(){if(q.length){var d=JSON.stringify(q);q=[];navigator.sendBeacon?navigator.sendBeacon(e,d):fetch(e,{method:"POST",body:d})}}t();var o=h.pushState;h.pushState=function(){o.apply(h,arguments);t()};onpopstate=t;setInterval(s,5e3);document.onvisibilitychange=function(){document.hidden&&s()}})()</script>`
}

export function aggregateEvents(events: AnalyticsEvent[]): AnalyticsSummary {
	const pages = new Map<string, number>()
	const terms = new Map<string, number>()
	let totalViews = 0

	for (const event of events) {
		if (event.type === "pageview") {
			totalViews++
			pages.set(event.path, (pages.get(event.path) ?? 0) + 1)
		}
		if (event.type === "search" && event.data?.term) {
			const term = event.data.term
			terms.set(term, (terms.get(term) ?? 0) + 1)
		}
	}

	const topPages = [...pages.entries()]
		.map(([path, views]) => ({ path, views }))
		.sort((a, b) => b.views - a.views)

	const searchTerms = [...terms.entries()]
		.map(([term, count]) => ({ term, count }))
		.sort((a, b) => b.count - a.count)

	return { topPages, searchTerms, totalViews }
}
