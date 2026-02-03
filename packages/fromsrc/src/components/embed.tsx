"use client"

import { memo, type JSX } from "react"

/**
 * Props for the YouTube embed component
 */
export interface YouTubeProps {
	id: string
	title?: string
}

export const YouTube = memo(function YouTube({
	id,
	title = "YouTube video",
}: YouTubeProps): JSX.Element {
	return (
		<div className="my-6 rounded-xl border border-line overflow-hidden aspect-video">
			<iframe
				src={`https://www.youtube.com/embed/${id}`}
				title={title}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				className="w-full h-full"
				loading="lazy"
				aria-label={title}
			/>
		</div>
	)
})

/**
 * Props for the CodeSandbox embed component
 */
export interface CodeSandboxProps {
	id: string
	title?: string
}

export const CodeSandbox = memo(function CodeSandbox({
	id,
	title = "CodeSandbox",
}: CodeSandboxProps): JSX.Element {
	return (
		<div className="my-6 rounded-xl border border-line overflow-hidden h-[300px] sm:h-[400px] md:h-[500px]">
			<iframe
				src={`https://codesandbox.io/embed/${id}?fontsize=14&hidenavigation=1&theme=dark`}
				title={title}
				allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
				sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
				className="w-full h-full"
				loading="lazy"
				aria-label={title}
			/>
		</div>
	)
})

/**
 * Props for the StackBlitz embed component
 */
export interface StackBlitzProps {
	id: string
	file?: string
	title?: string
}

export const StackBlitz = memo(function StackBlitz({
	id,
	file,
	title = "StackBlitz",
}: StackBlitzProps): JSX.Element {
	const fileParam = file ? `&file=${encodeURIComponent(file)}` : ""
	return (
		<div className="my-6 rounded-xl border border-line overflow-hidden h-[300px] sm:h-[400px] md:h-[500px]">
			<iframe
				src={`https://stackblitz.com/edit/${id}?embed=1&theme=dark${fileParam}`}
				title={title}
				className="w-full h-full"
				loading="lazy"
				aria-label={title}
			/>
		</div>
	)
})

/**
 * Props for the Tweet embed component
 */
export interface TweetProps {
	id: string
}

export const Tweet = memo(function Tweet({ id }: TweetProps): JSX.Element {
	return (
		<div className="my-6 flex justify-center" role="region" aria-label="Embedded tweet">
			<blockquote className="twitter-tweet" data-theme="dark">
				<a
					href={`https://twitter.com/x/status/${id}`}
					rel="noopener noreferrer"
					target="_blank"
				>
					Loading tweet...
				</a>
			</blockquote>
		</div>
	)
})

/**
 * Props for the GitHub Gist embed component
 */
export interface GistProps {
	id: string
	file?: string
	title?: string
}

export const Gist = memo(function Gist({
	id,
	file,
	title = "GitHub Gist",
}: GistProps): JSX.Element {
	const fileParam = file ? `?file=${encodeURIComponent(file)}` : ""
	return (
		<div className="my-6 rounded-xl border border-line overflow-hidden">
			<iframe
				src={`https://gist.github.com/${id}.pibb${fileParam}`}
				className="w-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px]"
				title={title}
				loading="lazy"
				aria-label={title}
			/>
		</div>
	)
})
