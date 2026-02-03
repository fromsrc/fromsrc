"use client"

import Image from "next/image"
import type { ReactNode } from "react"

interface QuoteProps {
	children: ReactNode
	author?: string
	role?: string
	avatar?: string
}

export function Quote({ children, author, role, avatar }: QuoteProps) {
	return (
		<figure className="my-6 p-6 rounded-xl border border-line bg-surface/30">
			<blockquote className="text-lg text-fg italic leading-relaxed">"{children}"</blockquote>
			{(author || role) && (
				<figcaption className="mt-4 flex items-center gap-3">
					{avatar && (
						<div className="w-10 h-10 rounded-full overflow-hidden relative">
							<Image src={avatar} alt={author || ""} fill className="object-cover" />
						</div>
					)}
					<div>
						{author && <div className="text-sm font-medium text-fg">{author}</div>}
						{role && <div className="text-xs text-muted">{role}</div>}
					</div>
				</figcaption>
			)}
		</figure>
	)
}

interface TestimonialsProps {
	children: ReactNode
}

export function Testimonials({ children }: TestimonialsProps) {
	return <div className="grid gap-4 md:grid-cols-2 my-6">{children}</div>
}

interface TestimonialProps {
	children: ReactNode
	author: string
	role?: string
	avatar?: string
}

export function Testimonial({ children, author, role, avatar }: TestimonialProps) {
	return (
		<figure className="p-5 rounded-xl border border-line bg-surface/30">
			<blockquote className="text-sm text-muted leading-relaxed">{children}</blockquote>
			<figcaption className="mt-4 flex items-center gap-3">
				{avatar && (
					<div className="w-8 h-8 rounded-full overflow-hidden relative">
						<Image src={avatar} alt={author} fill className="object-cover" />
					</div>
				)}
				<div>
					<div className="text-sm font-medium text-fg">{author}</div>
					{role && <div className="text-xs text-muted">{role}</div>}
				</div>
			</figcaption>
		</figure>
	)
}
