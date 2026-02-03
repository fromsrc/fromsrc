import Image from "next/image"
import { memo, type JSX, type ReactNode } from "react"

/**
 * Props for the Screenshot component
 */
export interface ScreenshotProps {
	/** Image source path or URL */
	src: string
	/** Alt text for accessibility */
	alt: string
	/** Optional caption displayed below the image */
	caption?: string
	/** Show browser chrome decoration */
	browser?: boolean
	/** Additional CSS classes */
	className?: string
}

export const Screenshot = memo(function Screenshot({
	src,
	alt,
	caption,
	browser = true,
	className = "",
}: ScreenshotProps): JSX.Element {
	return (
		<figure className={`my-6 ${className}`} role="figure" aria-label={caption || alt}>
			{browser ? (
				<div className="rounded-lg border border-line overflow-hidden bg-surface">
					<div
						className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-bg"
						aria-hidden="true"
					>
						<div className="flex gap-1.5">
							<span className="w-3 h-3 rounded-full bg-red-500/80" aria-hidden="true" />
							<span className="w-3 h-3 rounded-full bg-yellow-500/80" aria-hidden="true" />
							<span className="w-3 h-3 rounded-full bg-green-500/80" aria-hidden="true" />
						</div>
						<div className="flex-1 mx-8">
							<div className="h-6 rounded bg-surface/80 border border-line" aria-hidden="true" />
						</div>
					</div>
					<div className="relative w-full aspect-video">
						<Image src={src} alt={alt} fill className="object-cover object-top" />
					</div>
				</div>
			) : (
				<div className="relative w-full aspect-video rounded-lg border border-line overflow-hidden">
					<Image src={src} alt={alt} fill className="object-cover object-top" />
				</div>
			)}
			{caption && (
				<figcaption className="mt-2 text-center text-sm text-muted">{caption}</figcaption>
			)}
		</figure>
	)
})

/**
 * Props for the Frame component
 */
export interface FrameProps {
	/** Content to display inside the frame */
	children: ReactNode
	/** Optional title displayed in the frame header */
	title?: string
	/** Additional CSS classes */
	className?: string
}

export const Frame = memo(function Frame({
	children,
	title,
	className = "",
}: FrameProps): JSX.Element {
	return (
		<section
			className={`my-6 rounded-lg border border-line overflow-hidden ${className}`}
			aria-label={title || "content frame"}
		>
			{title && (
				<header className="px-4 py-2 border-b border-line bg-surface/50">
					<span className="text-xs text-muted">{title}</span>
				</header>
			)}
			<div className="p-4 bg-bg">{children}</div>
		</section>
	)
})
