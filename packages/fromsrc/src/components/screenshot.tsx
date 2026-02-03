import Image from "next/image"
import type { ReactNode } from "react"

interface Props {
	src: string
	alt: string
	caption?: string
	browser?: boolean
	className?: string
}

export function Screenshot({ src, alt, caption, browser = true, className = "" }: Props) {
	return (
		<figure className={`my-6 ${className}`}>
			{browser ? (
				<div className="rounded-lg border border-line overflow-hidden bg-surface">
					<div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-bg">
						<div className="flex gap-1.5">
							<span className="w-3 h-3 rounded-full bg-red-500/80" />
							<span className="w-3 h-3 rounded-full bg-yellow-500/80" />
							<span className="w-3 h-3 rounded-full bg-green-500/80" />
						</div>
						<div className="flex-1 mx-8">
							<div className="h-6 rounded bg-surface/80 border border-line" />
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
}

interface FrameProps {
	children: ReactNode
	title?: string
	className?: string
}

export function Frame({ children, title, className = "" }: FrameProps) {
	return (
		<div className={`my-6 rounded-lg border border-line overflow-hidden ${className}`}>
			{title && (
				<div className="px-4 py-2 border-b border-line bg-surface/50">
					<span className="text-xs text-muted">{title}</span>
				</div>
			)}
			<div className="p-4 bg-bg">{children}</div>
		</div>
	)
}
