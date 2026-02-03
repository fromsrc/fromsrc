"use client"

import { useState } from "react"

export interface VideoProps {
	src: string
	title?: string
	poster?: string
	autoplay?: boolean
	loop?: boolean
	muted?: boolean
	controls?: boolean
}

export function Video({
	src,
	title,
	poster,
	autoplay = false,
	loop = false,
	muted = false,
	controls = true,
}: VideoProps) {
	const [error, setError] = useState(false)

	if (error) {
		return (
			<div className="my-4 aspect-video rounded-lg border border-line bg-surface/30 flex items-center justify-center text-muted text-sm">
				failed to load video
			</div>
		)
	}

	const isYoutube = src.includes("youtube.com") || src.includes("youtu.be")
	const isVimeo = src.includes("vimeo.com")

	if (isYoutube) {
		const id = src.includes("youtu.be") ? src.split("/").pop() : new URL(src).searchParams.get("v")

		return (
			<div className="my-4 aspect-video rounded-lg overflow-hidden border border-line">
				<iframe
					src={`https://www.youtube.com/embed/${id}${autoplay ? "?autoplay=1" : ""}`}
					title={title || "youtube video"}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					className="w-full h-full"
				/>
			</div>
		)
	}

	if (isVimeo) {
		const id = src.split("/").pop()

		return (
			<div className="my-4 aspect-video rounded-lg overflow-hidden border border-line">
				<iframe
					src={`https://player.vimeo.com/video/${id}${autoplay ? "?autoplay=1" : ""}`}
					title={title || "vimeo video"}
					allow="autoplay; fullscreen; picture-in-picture"
					allowFullScreen
					className="w-full h-full"
				/>
			</div>
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
			className="my-4 w-full rounded-lg border border-line"
		>
			{title}
		</video>
	)
}
