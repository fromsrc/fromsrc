import { execSync } from "node:child_process"

export function lastModified(filepath: string): Date | null {
	try {
		const result = execSync(`git log -1 --format=%cI "${filepath}"`, {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim()
		return result ? new Date(result) : null
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
