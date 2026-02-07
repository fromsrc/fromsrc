"use client"

import { memo } from "react"
import type { JSX } from "react"

export interface EditLinkProps {
	repo: string
	path: string
	branch?: string
	label?: string
	className?: string
	provider?: "github" | "gitlab" | "bitbucket"
}

function buildUrl(repo: string, path: string, branch: string, provider: string): string {
	const [, org, name] = repo.split("/")
	if (provider === "gitlab") return `https://gitlab.com/${org}/${name}/-/edit/${branch}/${path}`
	if (provider === "bitbucket")
		return `https://bitbucket.org/${org}/${name}/src/${branch}/${path}?mode=edit`
	return `https://github.com/${org}/${name}/edit/${branch}/${path}`
}

function EditLinkBase({
	repo,
	path,
	branch = "main",
	label = "Edit this page",
	className,
	provider = "github",
}: EditLinkProps): JSX.Element {
	const href = buildUrl(repo, path, branch, provider)
	return (
		<a href={href} target="_blank" rel="noopener noreferrer" className={className}>
			<svg
				aria-hidden="true"
				width={14}
				height={14}
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
				<path d="m15 5 4 4" />
			</svg>
			{label}
		</a>
	)
}

export const EditLink = memo(EditLinkBase)
