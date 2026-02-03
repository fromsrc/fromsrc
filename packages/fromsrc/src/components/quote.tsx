"use client"

import Image from "next/image"
import { type ReactNode, memo } from "react"

/**
 * Props for the Quote component
 */
export interface QuoteProps {
	/** Quote content */
	children: ReactNode
	/** Author name */
	author?: string
	/** Author role or title */
	role?: string
	/** Avatar image URL */
	avatar?: string
}

function QuoteBase({ children, author, role, avatar }: QuoteProps): React.JSX.Element {
	return (
		<figure className="my-6 p-6 rounded-xl border border-line bg-surface/30">
			<blockquote className="text-lg text-fg italic leading-relaxed">"{children}"</blockquote>
			{author && (
				<figcaption className="mt-4 flex items-center gap-3">
					{avatar && (
						<div className="w-10 h-10 rounded-full overflow-hidden relative">
							<Image src={avatar} alt="" fill className="object-cover" aria-hidden="true" />
						</div>
					)}
					<div>
						<cite className="text-sm font-medium text-fg not-italic">{author}</cite>
						{role && <p className="text-xs text-muted">{role}</p>}
					</div>
				</figcaption>
			)}
		</figure>
	)
}

export const Quote = memo(QuoteBase)

/**
 * Props for the Testimonials grid container
 */
export interface TestimonialsProps {
	/** Testimonial components */
	children: ReactNode
}

function TestimonialsBase({ children }: TestimonialsProps): React.JSX.Element {
	return <div className="grid gap-4 md:grid-cols-2 my-6">{children}</div>
}

export const Testimonials = memo(TestimonialsBase)

/**
 * Props for the Testimonial component
 */
export interface TestimonialProps {
	/** Testimonial content */
	children: ReactNode
	/** Author name */
	author: string
	/** Author role or title */
	role?: string
	/** Avatar image URL */
	avatar?: string
}

function TestimonialBase({ children, author, role, avatar }: TestimonialProps): React.JSX.Element {
	return (
		<figure className="p-5 rounded-xl border border-line bg-surface/30">
			<blockquote className="text-sm text-muted leading-relaxed">{children}</blockquote>
			<figcaption className="mt-4 flex items-center gap-3">
				{avatar && (
					<div className="w-8 h-8 rounded-full overflow-hidden relative">
						<Image src={avatar} alt="" fill className="object-cover" aria-hidden="true" />
					</div>
				)}
				<div>
					<cite className="text-sm font-medium text-fg not-italic">{author}</cite>
					{role && <p className="text-xs text-muted">{role}</p>}
				</div>
			</figcaption>
		</figure>
	)
}

export const Testimonial = memo(TestimonialBase)
