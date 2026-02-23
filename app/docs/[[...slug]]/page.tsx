import { calcReadTime, lastModified } from "fromsrc"
import { Breadcrumb, Toc } from "fromsrc/client"
import type { Metadata } from "next"
import { unstable_noStore as noStore } from "next/cache"
import Link from "next/link"
import { notFound } from "next/navigation"
import { repourl, siteurl } from "@/app/_lib/site"
import { MDX } from "../_components/mdx"
import { getAllDocs, getDoc } from "../_lib/content"
import { jsonld, neighbors, ogquery, orderdocs } from "../_lib/pageutil"

type Props = {
	params: Promise<{ slug?: string[] }>
}

const site = siteurl()
const repo = repourl()

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
	const docs = await getAllDocs()
	return docs.map((doc) => ({
		slug: doc.slug ? doc.slug.split("/") : [],
	}))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	if (process.env.NODE_ENV !== "production") {
		noStore()
	}
	const { slug = [] } = await params
	const doc = await getDoc(slug)

	if (!doc) return { title: "not found" }

	const query = ogquery(doc.title, doc.description)

	return {
		title: doc.title,
		description: doc.description,
		openGraph: {
			title: doc.title,
			description: doc.description,
			images: [{ url: `/api/og?${query}`, width: 1200, height: 630 }],
		},
		twitter: {
			card: "summary_large_image",
			title: doc.title,
			description: doc.description,
			images: [`/api/og?${query}`],
		},
	}
}

export default async function DocPage({ params }: Props) {
	if (process.env.NODE_ENV !== "production") {
		noStore()
	}
	const { slug = [] } = await params
	const [doc, rawDocs] = await Promise.all([getDoc(slug), getAllDocs()])
	const allDocs = orderdocs(rawDocs)

	if (!doc) notFound()

	const readTime = calcReadTime(doc.content)
	const modified = lastModified(
		`${process.cwd()}/docs/${doc.slug || "index"}.mdx`,
	)
	const { prev, next } = neighbors(allDocs, doc.slug)
	const payload = jsonld(site, slug, doc, modified)

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
			/>
			<div className="flex w-full max-w-7xl mx-auto">
			<article className="flex-1 min-w-0 py-12 px-8 lg:px-12">
				<header className="mb-8 pb-6 border-b border-line">
					<div className="mb-4">
						<Breadcrumb base="/docs" />
					</div>
					<h1 className="text-2xl font-medium mb-2 text-fg">{doc.title}</h1>
					{doc.description && <p className="text-sm text-muted mb-4">{doc.description}</p>}
					<div className="flex items-center gap-3 text-xs text-dim">
						<span>{readTime} min read</span>
						<span aria-hidden="true">·</span>
						<a
							href={`${repo}/edit/main/docs/${doc.slug || "index"}.mdx`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-muted hover:text-fg transition-colors"
						>
							<svg
								className="w-3 h-3"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
							edit
						</a>
					</div>
				</header>
				<div className="prose">
					<MDX source={doc.content} />
				</div>
				<nav className="mt-8 pt-8 border-t border-line flex justify-between gap-4">
					{prev ? (
						<Link href={prev.slug ? `/docs/${prev.slug}` : "/docs"} className="group flex-1">
							<span className="flex items-center gap-2 text-[10px] text-muted group-hover:text-dim transition-colors">
								<kbd className="px-1.5 py-0.5 bg-surface border border-line rounded text-[9px]">
									←
								</kbd>
								previous
							</span>
							<span className="block text-sm text-fg group-hover:text-muted transition-colors">
								{prev.title}
							</span>
						</Link>
					) : (
						<div />
					)}
					{next ? (
						<Link
							href={next.slug ? `/docs/${next.slug}` : "/docs"}
							className="group flex-1 text-right"
						>
							<span className="flex items-center justify-end gap-2 text-[10px] text-muted group-hover:text-dim transition-colors">
								next
								<kbd className="px-1.5 py-0.5 bg-surface border border-line rounded text-[9px]">
									→
								</kbd>
							</span>
							<span className="block text-sm text-fg group-hover:text-muted transition-colors">
								{next.title}
							</span>
						</Link>
					) : (
						<div />
					)}
				</nav>
			</article>
			<Toc variant="minimal" zigzag />
		</div>
		</>
	)
}
