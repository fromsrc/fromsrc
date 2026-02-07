import { join, resolve } from "node:path"

export interface VersionConfig {
	versions: string[]
	latest: string
	docsDir: string
	strategy?: "directory" | "branch"
}

export interface VersionInfo {
	version: string
	label: string
	path: string
	isCurrent: boolean
}

export function createVersioning(config: VersionConfig) {
	const { versions, latest, docsDir, strategy = "directory" } = config

	const versionSet = new Set(versions)

	const infos: VersionInfo[] = versions.map((v) => ({
		version: v,
		label: v === latest ? `${v} (latest)` : v,
		path: v === latest ? "/" : `/${v}`,
		isCurrent: v === latest,
	}))

	function getVersion(pathname: string): string {
		const segment = pathname.split("/").filter(Boolean)[0]
		if (segment && versionSet.has(segment)) return segment
		return latest
	}

	function getVersionedPath(path: string, version: string): string {
		if (version === latest) return path
		const clean = path.startsWith("/") ? path : `/${path}`
		return `/${version}${clean}`
	}

	function stripVersion(pathname: string): string {
		const segment = pathname.split("/").filter(Boolean)[0]
		if (segment && versionSet.has(segment)) {
			return pathname.replace(`/${segment}`, "") || "/"
		}
		return pathname
	}

	function getDocsDir(version: string): string {
		if (strategy === "branch") return version
		return resolve(join(docsDir, version))
	}

	function getLatest(): string {
		return latest
	}

	function isLatest(version: string): boolean {
		return version === latest
	}

	return {
		versions: infos,
		getVersion,
		getVersionedPath,
		stripVersion,
		getDocsDir,
		getLatest,
		isLatest,
	}
}
