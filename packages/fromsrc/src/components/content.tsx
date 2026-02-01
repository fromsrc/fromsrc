"use client"

import { useEffect, useState, type ReactNode, type ComponentPropsWithoutRef } from "react"
import type { MDXModule } from "mdx/types"
import { CodeBlock } from "./codeblock"
import { Install } from "./install"
import { Create } from "./create"
import { Callout } from "./callout"
import { Steps, Step } from "./steps"
import { Tabs, Tab } from "./tabs"
import { Cards, Card } from "./cards"
import { Accordion, AccordionItem } from "./accordion"
import { Files, File, Folder } from "./files"

interface Props {
	source: string
}

type HeadingProps = ComponentPropsWithoutRef<"h1"> & { children?: ReactNode }
type ParagraphProps = ComponentPropsWithoutRef<"p">
type AnchorProps = ComponentPropsWithoutRef<"a">
type ListProps = ComponentPropsWithoutRef<"ul">
type ListItemProps = ComponentPropsWithoutRef<"li"> & { children?: ReactNode }
type StrongProps = ComponentPropsWithoutRef<"strong">
type CodeProps = ComponentPropsWithoutRef<"code"> & { children?: ReactNode; className?: string }
type PreProps = ComponentPropsWithoutRef<"pre"> & {
	children?: ReactNode
	className?: string
	"data-language"?: string
}
type BlockquoteProps = ComponentPropsWithoutRef<"blockquote">
type TableProps = ComponentPropsWithoutRef<"table">
type TheadProps = ComponentPropsWithoutRef<"thead">
type ThProps = ComponentPropsWithoutRef<"th">
type TdProps = ComponentPropsWithoutRef<"td">
type TrProps = ComponentPropsWithoutRef<"tr">

function getId(children: ReactNode): string {
	if (typeof children === "string") {
		return children.toLowerCase().replace(/\s+/g, "-")
	}
	return ""
}

const components = {
	h1: (props: HeadingProps) => (
		<h1 className="text-2xl font-medium mt-12 mb-4 first:mt-0 text-fg" {...props} />
	),
	h2: (props: HeadingProps) => (
		<h2
			id={getId(props.children)}
			className="text-lg font-medium mt-10 mb-4 pb-2 border-b border-line scroll-mt-20 text-fg"
			{...props}
		/>
	),
	h3: (props: HeadingProps) => (
		<h3
			id={getId(props.children)}
			className="text-base font-medium mt-8 mb-3 scroll-mt-20 text-fg"
			{...props}
		/>
	),
	p: (props: ParagraphProps) => <p className="mb-4 text-muted leading-7" {...props} />,
	a: (props: AnchorProps) => (
		<a
			className="text-fg underline decoration-line underline-offset-4 hover:decoration-fg transition-colors"
			{...props}
		/>
	),
	ul: (props: ListProps) => <ul className="my-4 space-y-2 text-muted" {...props} />,
	ol: (props: ListProps) => (
		<ol className="my-4 space-y-2 text-muted list-decimal list-inside" {...props} />
	),
	li: (props: ListItemProps) => (
		<li className="flex gap-2">
			<span className="text-dim select-none">•</span>
			<span>{props.children}</span>
		</li>
	),
	strong: (props: StrongProps) => <strong className="font-medium text-fg" {...props} />,
	code: (props: CodeProps) => {
		const text = typeof props.children === "string" ? props.children : ""
		const isInline = typeof props.children === "string" && !text.includes("\n")
		if (!isInline) {
			return <code {...props} />
		}
		return (
			<code
				style={{
					padding: "2px 6px",
					backgroundColor: "#141414",
					border: "1px solid #1c1c1c",
					borderRadius: "4px",
					fontSize: "12px",
					fontFamily: "var(--font-mono), ui-monospace, monospace",
				}}
				{...props}
			/>
		)
	},
	pre: (props: PreProps) => {
		const lang = props["data-language"] || ""
		return (
			<CodeBlock lang={lang}>
				<pre
					{...props}
					style={{
						margin: 0,
						padding: 0,
						background: "transparent",
						fontFamily: "var(--font-mono), ui-monospace, monospace",
					}}
				/>
			</CodeBlock>
		)
	},
	blockquote: (props: BlockquoteProps) => (
		<blockquote className="my-6 pl-4 border-l-2 border-line text-muted italic" {...props} />
	),
	hr: () => <hr className="border-line my-12" />,
	table: (props: TableProps) => (
		<div className="my-6 overflow-x-auto rounded-xl border border-line">
			<table className="w-full text-sm" {...props} />
		</div>
	),
	thead: (props: TheadProps) => <thead className="bg-surface" {...props} />,
	th: (props: ThProps) => (
		<th className="text-left px-4 py-3 font-medium text-fg border-b border-line" {...props} />
	),
	td: (props: TdProps) => (
		<td className="px-4 py-3 border-b border-line/50 text-muted" {...props} />
	),
	tr: (props: TrProps) => <tr className="hover:bg-surface/50 transition-colors" {...props} />,
	Install,
	Create,
	Callout,
	Steps,
	Step,
	Tabs,
	Tab,
	Cards,
	Card,
	Accordion,
	AccordionItem,
	Files,
	File,
	Folder,
}

export function Content({ source }: Props) {
	const [Content, setContent] = useState<React.ComponentType<{
		components: typeof components
	}> | null>(null)

	useEffect(() => {
		async function load() {
			const { compile, run } = await import("@mdx-js/mdx")
			const { default: remarkGfm } = await import("remark-gfm")
			const { default: rehypeShiki } = await import("@shikijs/rehype")
			const {
				transformerNotationHighlight,
				transformerNotationDiff,
				transformerNotationFocus,
			} = await import("@shikijs/transformers")
			const runtime = await import("react/jsx-runtime")

			const code = await compile(source, {
				outputFormat: "function-body",
				remarkPlugins: [remarkGfm],
				rehypePlugins: [
					[
						rehypeShiki,
						{
							theme: "github-dark-default",
							defaultColor: false,
							transformers: [
								transformerNotationHighlight(),
								transformerNotationDiff(),
								transformerNotationFocus(),
								{
									pre(node: { properties: Record<string, string> }) {
										const lang = (this as unknown as { options: { lang?: string } }).options
											.lang || ""
										if (lang) {
											node.properties["data-language"] = lang
										}
									},
								},
							],
						},
					],
				],
			})

			const module = (await run(String(code), {
				...runtime,
				baseUrl: import.meta.url,
			})) as MDXModule

			setContent(
				() => module.default as React.ComponentType<{ components: typeof components }>
			)
		}
		load()
	}, [source])

	if (!Content) {
		return (
			<div className="space-y-4 animate-pulse">
				<div className="h-6 bg-surface rounded w-1/3" />
				<div className="h-4 bg-surface/50 rounded w-full" />
				<div className="h-4 bg-surface/50 rounded w-5/6" />
				<div className="h-4 bg-surface/50 rounded w-4/6" />
				<div className="h-32 bg-surface/30 rounded mt-6" />
			</div>
		)
	}

	return <Content components={components} />
}
