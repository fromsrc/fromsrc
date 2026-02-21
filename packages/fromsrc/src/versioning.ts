export type DocVersion = {
	label: string
	path: string
	isLatest?: boolean
	isDefault?: boolean
}

export type VersionConfig = {
	versions: DocVersion[]
	versionedPaths?: string[]
}

export type VersionedPage = {
	version: DocVersion
	path: string
	alternateVersions: DocVersion[]
}

export function parseVersion(label: string): { major: number; minor: number; patch: number } {
	const clean = label.replace(/^v/, "")
	const parts = clean.split(".")
	const majorRaw = parts[0]
	const minorRaw = parts[1]
	const patchRaw = parts[2]
	return {
		major: Number.parseInt(majorRaw ?? "0", 10) || 0,
		minor: Number.parseInt(minorRaw ?? "0", 10) || 0,
		patch: Number.parseInt(patchRaw ?? "0", 10) || 0,
	}
}

export function compareVersions(a: string, b: string): number {
	const va = parseVersion(a)
	const vb = parseVersion(b)
	if (va.major !== vb.major) return va.major > vb.major ? 1 : -1
	if (va.minor !== vb.minor) return va.minor > vb.minor ? 1 : -1
	if (va.patch !== vb.patch) return va.patch > vb.patch ? 1 : -1
	return 0
}

export function sortVersions(versions: DocVersion[]): DocVersion[] {
	return [...versions].sort((a, b) => compareVersions(b.label, a.label))
}

export function resolveVersion(path: string, config: VersionConfig): VersionedPage | null {
	const segments = path.split("/").filter(Boolean)
	const first = segments[0]
	const match = config.versions.find((v) => v.path === `/${first}` || v.label === first)
	if (!match) return null
	const rest = segments.slice(1).join("/")
	return {
		version: match,
		path: rest ? `/${rest}` : "/",
		alternateVersions: config.versions.filter((v) => v.label !== match.label),
	}
}

export function getLatestVersion(config: VersionConfig): DocVersion {
	const latest = config.versions.find((v) => v.isLatest)
	if (latest) return latest
	return sortVersions(config.versions)[0] ?? { label: "latest", path: "/" }
}

export function isVersionedPath(path: string, config: VersionConfig): boolean {
	const segments = path.split("/").filter(Boolean)
	const first = segments[0]
	if (!first) return false
	if (config.versionedPaths?.length) {
		return config.versionedPaths.some((p) => path.startsWith(p))
	}
	return config.versions.some((v) => v.path === `/${first}` || v.label === first)
}

export function createVersionSwitcher(config: VersionConfig) {
	return {
		resolve: (path: string) => resolveVersion(path, config),
		latest: () => getLatestVersion(config),
		switchVersion: (path: string, target: DocVersion) => {
			const resolved = resolveVersion(path, config)
			const base = resolved ? resolved.path : path
			return `${target.path}${base === "/" ? "" : base}`
		},
	}
}
