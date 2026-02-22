export type DraftConfig = {
	secret: string
	cookieName?: string
	maxAge?: number
}

export type DraftInfo = {
	enabled: boolean
	token?: string
	expires?: number
}

export type DraftFilter = {
	includeDrafts: boolean
}

export function createDraftMode(config: DraftConfig) {
	const cookieName = config.cookieName ?? "fromsrc-preview"
	const maxAge = config.maxAge ?? 3600

	function enable(token: string) {
		if (!validateToken(token)) {
			throw new Error("invalid token")
		}
		return { cookie: cookieName, value: token, maxAge }
	}

	function disable() {
		return { cookie: cookieName, value: "", maxAge: 0 }
	}

	function check(cookieValue: string | undefined): DraftInfo {
		if (!cookieValue) {
			return { enabled: false }
		}
		if (!validateToken(cookieValue)) {
			return { enabled: false }
		}
		const decoded = atob(cookieValue)
		const timestamp = Number(decoded.slice(config.secret.length + 1))
		return { enabled: true, token: cookieValue, expires: timestamp + maxAge * 1000 }
	}

	function generateToken(): string {
		const timestamp = Date.now()
		return btoa(`${config.secret}:${timestamp}`)
	}

	function validateToken(token: string): boolean {
		try {
			const decoded = atob(token)
			return decoded.startsWith(`${config.secret}:`)
		} catch {
			return false
		}
	}

	return { enable, disable, check, generateToken, validateToken }
}

export function filterDrafts<T>(items: T[], key: keyof T, filter: DraftFilter): T[] {
	if (filter.includeDrafts) {
		return items
	}
	return items.filter((item) => !item[key])
}

export function isDraft(frontmatter: Record<string, unknown>): boolean {
	return frontmatter.draft === true
}

export function scheduledDraft(frontmatter: Record<string, unknown>): boolean {
	const publishDate = frontmatter.publishDate
	if (!publishDate) {
		return false
	}
	if (
		typeof publishDate !== "string" &&
		typeof publishDate !== "number" &&
		!(publishDate instanceof Date)
	) {
		return false
	}
	const date = new Date(publishDate)
	if (Number.isNaN(date.getTime())) {
		return false
	}
	return date.getTime() > Date.now()
}
