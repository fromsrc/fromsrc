import { execFileSync } from "node:child_process"

export function lastModified(filepath: string): Date | null {
	try {
		const result = execFileSync("git", ["log", "-1", "--format=%cI", filepath], {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim()
		if (!result) return null
		const value = new Date(result)
		return Number.isNaN(value.getTime()) ? null : value
	} catch {
		return null
	}
}

export function lastModifiedAll(
	filepaths: string[],
): Map<string, Date | null> {
	const results = new Map<string, Date | null>()
	for (const filepath of filepaths) {
		results.set(filepath, lastModified(filepath))
	}
	return results
}
