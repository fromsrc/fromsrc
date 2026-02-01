import { notFound } from "next/navigation"
import Link from "next/link"
import { Content, Toc } from "fromsrc/client"
import { getDoc, getAllDocs } from "../_lib/content"

interface Props {
	params: Promise<{ slug?: string[] }>
}

export async function generateStaticParams() {
	const docs = await getAllDocs()
	return docs.map((doc) => ({
		slug: doc.slug ? doc.slug.split("/") : [],
	}))
}

export async function generateMetadata({ params }: Props) {
	const { slug = [] } = await params
	const doc = await getDoc(slug)

	if (!doc) return { title: "not found" }

	return {
		title: `${doc.title} | fromsrc`,
		description: doc.description,
	}
}

export default async function DocPage({ params }: Props) {
	const { slug = [] } = await params
	const doc = await getDoc(slug)
	const allDocs = await getAllDocs()

	if (!doc) notFound()

	const currentIndex = allDocs.findIndex((d) => d.slug === doc.slug)
	const prev = currentIndex > 0 ? allDocs[currentIndex - 1] : null
	const next = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null

	return (
		<div className="flex min-h-screen">
			<article className="flex-1 max-w-3xl py-12 px-8 lg:px-12">
				<header className="mb-10">
					<p className="text-xs text-muted mb-2">documentation</p>
					<h1 className="text-2xl font-medium mb-3 text-fg">{doc.title}</h1>
					{doc.description && (
						<p className="text-sm text-muted">{doc.description}</p>
					)}
				</header>
				<div className="prose">
					<Content source={doc.content} />
				</div>
				<nav className="mt-16 pt-8 border-t border-line flex justify-between gap-4">
					{prev ? (
						<Link
							href={prev.slug ? `/docs/${prev.slug}` : "/docs"}
							className="group flex-1"
						>
							<span className="text-[10px] text-muted group-hover:text-dim transition-colors">
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
							<span className="text-[10px] text-muted group-hover:text-dim transition-colors">
								next
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
	)
}
