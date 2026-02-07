import type { DocMeta } from "fromsrc"
import { Breadcrumb, Toc } from "fromsrc/client"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MDX } from "../_components/mdx"
import { getAllDocs, getDoc } from "../_lib/content"

type Props = {
	params: Promise<{ slug?: string[] }>
}

function sortDocs(docs: DocMeta[]): DocMeta[] {
	const intro: DocMeta[] = []
	const components: DocMeta[] = []
	const api: DocMeta[] = []
	const other: DocMeta[] = []

	for (const doc of docs) {
		if (doc.slug.startsWith("components/")) {
			components.push(doc)
		} else if (doc.slug.startsWith("api/")) {
			api.push(doc)
		} else if (!doc.slug || doc.slug.match(/^[^/]+$/)) {
			intro.push(doc)
		} else {
			other.push(doc)
		}
	}

	const sortByOrder = (a: DocMeta, b: DocMeta) => (a.order ?? 999) - (b.order ?? 999)
	return [
		...intro.sort(sortByOrder),
		...components.sort(sortByOrder),
		...api.sort(sortByOrder),
		...other.sort(sortByOrder),
	]
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
	const docs = await getAllDocs()
	return docs.map((doc) => ({
		slug: doc.slug ? doc.slug.split("/") : [],
	}))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug = [] } = await params
	const doc = await getDoc(slug)

	if (!doc) return { title: "not found" }

	const ogParams = new URLSearchParams({ title: doc.title })
	if (doc.description) ogParams.set("description", doc.description)

	return {
		title: doc.title,
		description: doc.description,
		openGraph: {
			title: doc.title,
			description: doc.description,
			images: [{ url: `/api/og?${ogParams}`, width: 1200, height: 630 }],
		},
		twitter: {
			card: "summary_large_image",
			title: doc.title,
			description: doc.description,
			images: [`/api/og?${ogParams}`],
		},
	}
}

export default async function DocPage({ params }: Props) {
	const { slug = [] } = await params
	const [doc, rawDocs] = await Promise.all([getDoc(slug), getAllDocs()])
	const allDocs = sortDocs(rawDocs)

	if (!doc) notFound()

	const currentIndex = allDocs.findIndex((d) => d.slug === doc.slug)
	const prev = currentIndex > 0 ? allDocs[currentIndex - 1] : null
	const next = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "TechArticle",
		headline: doc.title,
		description: doc.description,
		url: `https://fromsrc.com/docs/${doc.slug}`,
		author: { "@type": "Organization", name: "fromsrc" },
		publisher: { "@type": "Organization", name: "fromsrc", url: "https://fromsrc.com" },
		mainEntityOfPage: { "@type": "WebPage", "@id": `https://fromsrc.com/docs/${doc.slug}` },
	}

	const breadcrumbItems = [
		{ "@type": "ListItem", position: 1, name: "Home", item: "https://fromsrc.com" },
		{ "@type": "ListItem", position: 2, name: "Docs", item: "https://fromsrc.com/docs" },
		...slug.map((segment, i) => ({
			"@type": "ListItem",
			position: i + 3,
			name: segment,
			item: `https://fromsrc.com/docs/${slug.slice(0, i + 1).join("/")}`,
		})),
	]

	const breadcrumbLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: breadcrumbItems,
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbLd]) }}
			/>
			<div className="flex w-full max-w-7xl mx-auto">
			<article className="flex-1 min-w-0 py-12 px-8 lg:px-12">
				<header className="mb-8 pb-6 border-b border-line">
					<div className="mb-4">
						<Breadcrumb base="/docs" />
					</div>
					<h1 className="text-2xl font-medium mb-2 text-fg">{doc.title}</h1>
					{doc.description && <p className="text-sm text-muted mb-4">{doc.description}</p>}
					<a
						href={`https://github.com/fromsrc/fromsrc/edit/main/docs/${doc.slug || "index"}.mdx`}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg transition-colors"
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
