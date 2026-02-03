"use client"

import { memo, useState } from "react"
import type { JSX, ReactElement } from "react"

/**
 * caption track configuration for native video elements
 */
export interface Caption {
	src: string
	label: string
	lang: string
	default?: boolean
}

/**
 * video player component props supporting native video, youtube, and vimeo
 */
export interface VideoProps {
	src: string
	title?: string
	poster?: string
	autoplay?: boolean
	loop?: boolean
	muted?: boolean
	controls?: boolean
	captions?: Caption[]
	className?: string
}

function extractYoutubeId(url: string): string | null {
	if (url.includes("youtu.be")) {
		return url.split("/").pop()?.split("?")[0] ?? null
	}
	try {
		return new URL(url).searchParams.get("v")
	} catch {
		return null
	}
}

function extractVimeoId(url: string): string | null {
	return url.split("/").pop()?.split("?")[0] ?? null
}

function VideoComponent({
	src,
	title,
	poster,
	autoplay = false,
	loop = false,
	muted = false,
	controls = true,
	captions,
	className = "",
}: VideoProps): ReactElement {
	const [error, setError] = useState(false)

	if (error) {
		return (
			<div
				role="alert"
				aria-live="polite"
				className={`my-6 aspect-video rounded-xl border border-line bg-surface/30 flex items-center justify-center text-muted text-sm ${className}`}
			>
				failed to load video
			</div>
		)
	}

	const isYoutube = src.includes("youtube.com") || src.includes("youtu.be")
	const isVimeo = src.includes("vimeo.com")

	if (isYoutube) {
		const id = extractYoutubeId(src)
		if (!id) {
			return (
				<div
					role="alert"
					aria-live="polite"
					className={`my-6 aspect-video rounded-xl border border-line bg-surface/30 flex items-center justify-center text-muted text-sm ${className}`}
				>
					invalid youtube url
				</div>
			)
		}
		const params = new URLSearchParams()
		if (autoplay) params.set("autoplay", "1")
		if (loop) params.set("loop", "1")
		const query = params.toString()

		return (
			<figure
				role="group"
				aria-label={title ?? "youtube video"}
				className={`my-6 aspect-video rounded-xl border border-line overflow-hidden ${className}`}
			>
				<iframe
					src={`https://www.youtube.com/embed/${id}${query ? `?${query}` : ""}`}
					title={title ?? "youtube video"}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					loading="lazy"
					className="w-full h-full"
				/>
			</figure>
		)
	}

	if (isVimeo) {
		const id = extractVimeoId(src)
		if (!id) {
			return (
				<div
					role="alert"
					aria-live="polite"
					className={`my-6 aspect-video rounded-xl border border-line bg-surface/30 flex items-center justify-center text-muted text-sm ${className}`}
				>
					invalid vimeo url
				</div>
			)
		}
		const params = new URLSearchParams()
		if (autoplay) params.set("autoplay", "1")
		if (loop) params.set("loop", "1")
		const query = params.toString()

		return (
			<figure
				role="group"
				aria-label={title ?? "vimeo video"}
				className={`my-6 aspect-video rounded-xl border border-line overflow-hidden ${className}`}
			>
				<iframe
					src={`https://player.vimeo.com/video/${id}${query ? `?${query}` : ""}`}
					title={title ?? "vimeo video"}
					allow="autoplay; fullscreen; picture-in-picture"
					allowFullScreen
					loading="lazy"
					className="w-full h-full"
				/>
			</figure>
		)
	}

	return (
		<video
			src={src}
			poster={poster}
			autoPlay={autoplay}
			loop={loop}
			muted={muted || autoplay}
			controls={controls}
			playsInline
			onError={() => setError(true)}
			aria-label={title ?? "video"}
			aria-describedby={captions?.length ? "video-captions" : undefined}
			className={`my-6 w-full aspect-video rounded-xl border border-line object-cover ${className}`}
		>
			{captions?.map((track): JSX.Element => (
				<track
					key={track.lang}
					kind="captions"
					src={track.src}
					srcLang={track.lang}
					label={track.label}
					default={track.default}
				/>
			))}
		</video>
	)
}

/**
 * video player with support for native video, youtube, and vimeo embeds
 */
export const Video = memo(VideoComponent)
