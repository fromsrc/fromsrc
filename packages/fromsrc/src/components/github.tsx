"use client"

import { memo, useEffect, useState } from "react"
import type { JSX } from "react"

/**
 * Props for the Github component
 */
export interface GithubProps {
	/** Repository in owner/name format */
	repo: string
}

/**
 * Parsed repository data for display
 */
interface RepoData {
	/** Star count */
	stars: number
	/** Fork count */
	forks: number
	/** Repository description */
	description: string | null
}

/**
 * GitHub API response shape
 */
interface GithubApiResponse {
	/** Star count from API */
	stargazers_count?: number
	/** Fork count from API */
	forks_count?: number
	/** Repository description from API */
	description?: string | null
}

function format(n: number): string {
	if (n >= 1000) {
		return `${(n / 1000).toFixed(1)}k`
	}
	return n.toString()
}

function GithubComponent({ repo }: GithubProps): JSX.Element {
	const [data, setData] = useState<RepoData | null>(null)

	useEffect(() => {
		let mounted = true
		async function load() {
			try {
				const res = await fetch(`https://api.github.com/repos/${repo}`)
				if (!res.ok || !mounted) return
				const json: GithubApiResponse = await res.json()
				if (!mounted) return
				const stars = typeof json.stargazers_count === "number" ? json.stargazers_count : 0
				const forks = typeof json.forks_count === "number" ? json.forks_count : 0
				setData({
					stars,
					forks,
					description: json.description ?? null,
				})
			} catch {
				return
			}
		}
		load()
		return () => {
			mounted = false
		}
	}, [repo])

	if (!data) {
		return (
			<div
				role="status"
				aria-live="polite"
				aria-busy="true"
				aria-label={`Loading ${repo} repository`}
				className="my-4 p-4 rounded-lg border border-line bg-surface/50 animate-pulse"
			>
				<div className="h-4 bg-surface rounded w-1/3 mb-2" aria-hidden="true" />
				<div className="h-3 bg-surface/50 rounded w-2/3" aria-hidden="true" />
			</div>
		)
	}

	return (
		<a
			href={`https://github.com/${repo}`}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`View ${repo} repository on GitHub with ${format(data.stars)} stars and ${format(data.forks)} forks`}
			className="my-4 p-4 rounded-lg border border-line bg-surface/30 hover:bg-surface/50 transition-colors flex items-start gap-4 no-underline"
		>
			<svg
				className="w-6 h-6 text-fg shrink-0 mt-0.5"
				fill="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					fillRule="evenodd"
					d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
					clipRule="evenodd"
				/>
			</svg>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-fg mb-1">{repo}</p>
				{data.description && (
					<p className="text-xs text-muted mb-2 line-clamp-2">{data.description}</p>
				)}
				<div className="flex items-center gap-4 text-xs text-muted" aria-hidden="true">
					<span className="flex items-center gap-1">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
							<path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
						</svg>
						{format(data.stars)}
					</span>
					<span className="flex items-center gap-1">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
							<path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 111.5 0v.878a2.25 2.25 0 01-2.25 2.25h-1.5v2.128a2.251 2.251 0 11-1.5 0V8.5h-1.5A2.25 2.25 0 013.5 6.25v-.878a2.25 2.25 0 111.5 0zM5 3.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm6.75.75a.75.75 0 10.75-.75.75.75 0 00-.75.75z" />
						</svg>
						{format(data.forks)}
					</span>
				</div>
			</div>
		</a>
	)
}

export const Github = memo(GithubComponent)
