export type Environment = "development" | "production" | "test" | "preview"
export type FeatureFlags = Record<string, boolean>

export function getEnv(): Environment {
	const vercel = process.env.VERCEL_ENV
	if (vercel === "preview") return "preview"
	if (vercel === "production") return "production"

	const node = process.env.NODE_ENV
	if (node === "test") return "test"
	if (node === "production") return "production"
	return "development"
}

export function isDev(): boolean {
	return getEnv() === "development"
}

export function isProd(): boolean {
	return getEnv() === "production"
}

export function isPreview(): boolean {
	return getEnv() === "preview"
}

export function getBaseUrl(): string {
	const vercel = process.env.VERCEL_URL
	if (vercel) return `https://${vercel}`

	const pub = process.env.NEXT_PUBLIC_URL
	if (pub) return pub

	const base = process.env.BASE_URL
	if (base) return base

	const port = process.env.PORT || "3000"
	return `http://localhost:${port}`
}

export function getFeatureFlags(prefix = "FEATURE_"): FeatureFlags {
	const flags: FeatureFlags = {}
	for (const [key, value] of Object.entries(process.env)) {
		if (key.startsWith(prefix) && value !== undefined) {
			const name = key.slice(prefix.length).toLowerCase()
			flags[name] = value === "true" || value === "1"
		}
	}
	return flags
}

export function requireEnv(name: string): string {
	const value = process.env[name]
	if (value === undefined || value === "") {
		throw new Error(`${name}`)
	}
	return value
}

export function optionalEnv(name: string, fallback?: string): string | undefined {
	return process.env[name] ?? fallback
}
