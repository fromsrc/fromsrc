import { execFile } from "node:child_process"
import { promisify } from "node:util"

const run = promisify(execFile)

export type Contributor = {
	name: string
	email: string
	commits: number
	lastCommit: Date
}

export type ContributorConfig = {
	dir: string
	file: string
	excludeEmails?: string[]
}

export async function getContributors(config: ContributorConfig): Promise<Contributor[]> {
	try {
		const { stdout } = await run("git", ["log", '--format=%aN|%aE|%aI', "--", config.file], {
			cwd: config.dir,
		})
		if (!stdout.trim()) return []
		const exclude = new Set(config.excludeEmails ?? [])
		const map = new Map<string, Contributor>()
		for (const line of stdout.trim().split("\n")) {
			const parts = line.split("|")
			const name = parts[0]
			const email = parts[1]
			const dateRaw = parts[2]
			if (!name || !email || !dateRaw) continue
			const date = new Date(dateRaw)
			if (Number.isNaN(date.getTime())) continue
			if (exclude.has(email)) continue
			const existing = map.get(email)
			if (existing) {
				existing.commits++
				if (date > existing.lastCommit) existing.lastCommit = date
			} else {
				map.set(email, { name, email, commits: 1, lastCommit: date })
			}
		}
		return [...map.values()].sort((a, b) => b.commits - a.commits)
	} catch {
		return []
	}
}

export async function getLastAuthor(config: ContributorConfig): Promise<Contributor | null> {
	const contributors = await getContributors(config)
	if (!contributors.length) return null
	return [...contributors].sort((a, b) => b.lastCommit.getTime() - a.lastCommit.getTime())[0] ?? null
}

export async function getEditHistory(
	config: ContributorConfig,
): Promise<{ hash: string; author: string; date: Date; message: string }[]> {
	try {
		const { stdout } = await run("git", ["log", '--format=%H|%aN|%aI|%s', "--", config.file], {
			cwd: config.dir,
		})
		if (!stdout.trim()) return []
		return stdout
			.trim()
			.split("\n")
			.map((line) => {
			const parts = line.split("|")
			const hash = parts[0]
			const author = parts[1]
			const dateRaw = parts[2]
			if (!hash || !author || !dateRaw) return null
			const date = new Date(dateRaw)
			if (Number.isNaN(date.getTime())) return null
			return { hash, author, date, message: parts.slice(3).join("|") }
		})
			.filter((item): item is { hash: string; author: string; date: Date; message: string } => item !== null)
	} catch {
		return []
	}
}

export function formatContributors(contributors: Contributor[]): string {
	return contributors.map((c) => `- ${c.name} (${c.commits} commits)`).join("\n")
}
