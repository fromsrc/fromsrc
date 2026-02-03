"use client"

export interface YouTubeProps {
	id: string
	title?: string
}

export function YouTube({ id, title = "YouTube video" }: YouTubeProps) {
	return (
		<div className="my-6 rounded-xl border border-line overflow-hidden aspect-video">
			<iframe
				src={`https://www.youtube.com/embed/${id}`}
				title={title}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				className="w-full h-full"
			/>
		</div>
	)
}

export interface CodeSandboxProps {
	id: string
	title?: string
}

export function CodeSandbox({ id, title = "CodeSandbox" }: CodeSandboxProps) {
	return (
		<div className="my-6 rounded-xl border border-line overflow-hidden h-[300px] sm:h-[400px] md:h-[500px]">
			<iframe
				src={`https://codesandbox.io/embed/${id}?fontsize=14&hidenavigation=1&theme=dark`}
				title={title}
				allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
				sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
				className="w-full h-full"
			/>
		</div>
	)
}

export interface StackBlitzProps {
	id: string
	file?: string
	title?: string
}

export function StackBlitz({ id, file, title = "StackBlitz" }: StackBlitzProps) {
	const fileParam = file ? `&file=${encodeURIComponent(file)}` : ""
	return (
		<div className="my-6 rounded-xl border border-line overflow-hidden h-[300px] sm:h-[400px] md:h-[500px]">
			<iframe
				src={`https://stackblitz.com/edit/${id}?embed=1&theme=dark${fileParam}`}
				title={title}
				className="w-full h-full"
			/>
		</div>
	)
}

export interface TweetProps {
	id: string
}

export function Tweet({ id }: TweetProps) {
	return (
		<div className="my-6 flex justify-center">
			<blockquote className="twitter-tweet" data-theme="dark">
				<a href={`https://twitter.com/x/status/${id}`}>Loading tweet...</a>
			</blockquote>
		</div>
	)
}

export interface GistProps {
	id: string
	file?: string
	title?: string
}

export function Gist({ id, file, title = "GitHub Gist" }: GistProps) {
	const fileParam = file ? `?file=${encodeURIComponent(file)}` : ""
	return (
		<div className="my-6 rounded-xl border border-line overflow-hidden">
			<iframe
				src={`https://gist.github.com/${id}.pibb${fileParam}`}
				className="w-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px]"
				title={title}
			/>
		</div>
	)
}
