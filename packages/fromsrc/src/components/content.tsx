"use client"

import type { MDXModule } from "mdx/types"
import {
	type ComponentPropsWithoutRef,
	type JSX,
	type ReactNode,
	memo,
	useEffect,
	useState,
} from "react"
import { Accordion, AccordionItem } from "./accordion"
import { Badge } from "./badge"
import { Banner } from "./banner"
import { Callout } from "./callout"
import { Card, Cards } from "./cards"
import { CodeBlock } from "./codeblock"
import { CodeGroup, CodeTab, CodeTabs } from "./codegroup"
import { Create } from "./create"
import { File, Files, Folder } from "./files"
import { Github } from "./github"
import { Install } from "./install"
import { Mermaid } from "./mermaid"
import { Step, Steps } from "./steps"
import { Tab, Tabs } from "./tabs"
import { TocInline } from "./toc/inline"
import { Tooltip } from "./tooltip"
import { TypeTable } from "./typetable"
import { Video } from "./video"
import { Zoom } from "./zoom"

/** props for the content component that renders mdx source */
export interface ContentProps {
	/** raw mdx source string to compile and render */
	source: string
}

/** props for heading elements (h1, h2, h3) */
type HeadingProps = ComponentPropsWithoutRef<"h1"> & { children?: ReactNode }

/** props for paragraph elements */
type ParagraphProps = ComponentPropsWithoutRef<"p">

/** props for anchor elements */
type AnchorProps = ComponentPropsWithoutRef<"a">

/** props for list elements (ul, ol) */
type ListProps = ComponentPropsWithoutRef<"ul">

/** props for list item elements */
type ListItemProps = ComponentPropsWithoutRef<"li"> & { children?: ReactNode }

/** props for strong/bold elements */
type StrongProps = ComponentPropsWithoutRef<"strong">

/** props for inline code elements */
type CodeProps = ComponentPropsWithoutRef<"code"> & { children?: ReactNode; className?: string }

/** props for pre/code block elements */
type PreProps = ComponentPropsWithoutRef<"pre"> & {
	children?: ReactNode
	className?: string
	"data-language"?: string
	"data-title"?: string
}

/** props for blockquote elements */
type BlockquoteProps = ComponentPropsWithoutRef<"blockquote">

/** props for table elements */
type TableProps = ComponentPropsWithoutRef<"table">

/** props for table head elements */
type TheadProps = ComponentPropsWithoutRef<"thead">

/** props for table header cell elements */
type ThProps = ComponentPropsWithoutRef<"th">

/** props for table data cell elements */
type TdProps = ComponentPropsWithoutRef<"td">

/** props for table row elements */
type TrProps = ComponentPropsWithoutRef<"tr">

function getId(children: ReactNode): string {
	if (typeof children === "string") {
		return children.toLowerCase().replace(/\s+/g, "-")
	}
	return ""
}

const components = {
	h1: (props: HeadingProps): JSX.Element => (
		<h1 className="text-2xl font-medium mt-12 mb-4 first:mt-0 text-fg" {...props} />
	),
	h2: (props: HeadingProps): JSX.Element => (
		<h2
			id={getId(props.children)}
			className="text-lg font-medium mt-10 mb-4 pb-2 border-b border-line scroll-mt-20 text-fg"
			{...props}
		/>
	),
	h3: (props: HeadingProps): JSX.Element => (
		<h3
			id={getId(props.children)}
			className="text-base font-medium mt-8 mb-3 scroll-mt-20 text-fg"
			{...props}
		/>
	),
	p: (props: ParagraphProps): JSX.Element => (
		<p className="mb-4 text-muted leading-7" {...props} />
	),
	a: (props: AnchorProps): JSX.Element => (
		<a
			className="text-fg underline decoration-line underline-offset-4 hover:decoration-fg transition-colors"
			{...props}
		/>
	),
	ul: (props: ListProps): JSX.Element => (
		<ul className="my-4 space-y-2 text-muted" role="list" {...props} />
	),
	ol: (props: ListProps): JSX.Element => (
		<ol className="my-4 space-y-2 text-muted list-decimal list-inside" role="list" {...props} />
	),
	li: (props: ListItemProps): JSX.Element => (
		<li className="flex gap-2" role="listitem">
			<span className="text-dim select-none" aria-hidden="true">
				•
			</span>
			<span>{props.children}</span>
		</li>
	),
	strong: (props: StrongProps): JSX.Element => (
		<strong className="font-medium text-fg" {...props} />
	),
	code: (props: CodeProps): JSX.Element => {
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
	pre: (props: PreProps): JSX.Element => {
		const lang = props["data-language"] || ""
		const title = props["data-title"] || ""
		return (
			<CodeBlock lang={lang} title={title || undefined}>
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
	blockquote: (props: BlockquoteProps): JSX.Element => (
		<blockquote className="my-6 pl-4 border-l-2 border-line text-muted italic" {...props} />
	),
	hr: (): JSX.Element => <hr className="border-line my-12" aria-hidden="true" />,
	table: (props: TableProps): JSX.Element => (
		<div className="my-6 overflow-x-auto rounded-xl border border-line" role="region">
			<table className="w-full text-sm" {...props} />
		</div>
	),
	thead: (props: TheadProps): JSX.Element => <thead className="bg-surface" {...props} />,
	th: (props: ThProps): JSX.Element => (
		<th
			className="text-left px-4 py-3 font-medium text-fg border-b border-line"
			scope="col"
			{...props}
		/>
	),
	td: (props: TdProps): JSX.Element => (
		<td className="px-4 py-3 border-b border-line/50 text-muted" {...props} />
	),
	tr: (props: TrProps): JSX.Element => (
		<tr className="hover:bg-surface/50 transition-colors" {...props} />
	),
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
	Badge,
	Banner,
	Zoom,
	CodeGroup,
	CodeTab,
	CodeTabs,
	TypeTable,
	Github,
	Tooltip,
	Video,
	Mermaid,
	TocInline,
}

function ContentBase({ source }: ContentProps): JSX.Element {
	const [MdxContent, setMdxContent] = useState<React.ComponentType<{
		components: typeof components
	}> | null>(null)

	useEffect(() => {
		async function load(): Promise<void> {
			const { compile, run } = await import("@mdx-js/mdx")
			const { default: remarkGfm } = await import("remark-gfm")
			const { default: rehypeShiki } = await import("@shikijs/rehype")
			const {
				transformerMetaHighlight,
				transformerNotationHighlight,
				transformerNotationDiff,
				transformerNotationFocus,
				transformerNotationWordHighlight,
			} = await import("@shikijs/transformers")
			const { transformerCollapse } = await import("../collapse")
			const runtime = await import("react/jsx-runtime")

			const code = await compile(source, {
				outputFormat: "function-body",
				remarkPlugins: [remarkGfm],
				rehypePlugins: [
					[
						rehypeShiki,
						{
							themes: {
								light: "github-light",
								dark: "github-dark-default",
							},
							defaultColor: false,
							transformers: [
								transformerMetaHighlight(),
								transformerNotationHighlight(),
								transformerNotationDiff(),
								transformerNotationFocus(),
								transformerNotationWordHighlight(),
								transformerCollapse(),
								{
									pre(node: { properties: Record<string, string> }) {
										const ctx = this as unknown as {
											options: { lang?: string; meta?: { __raw?: string } }
										}
										const lang = ctx.options.lang || ""
										if (lang) {
											node.properties["data-language"] = lang
										}
										const meta = ctx.options.meta?.__raw || ""
										const match = meta.match(/title="([^"]*)"/)
										if (match) {
											node.properties["data-title"] = match[1]!
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

			setMdxContent(
				() => module.default as React.ComponentType<{ components: typeof components }>
			)
		}
		load()
	}, [source])

	if (!MdxContent) {
		return (
			<div className="space-y-4 animate-pulse" aria-busy="true" aria-label="loading content">
				<div className="h-6 bg-surface rounded w-1/3" />
				<div className="h-4 bg-surface/50 rounded w-full" />
				<div className="h-4 bg-surface/50 rounded w-5/6" />
				<div className="h-4 bg-surface/50 rounded w-4/6" />
				<div className="h-32 bg-surface/30 rounded mt-6" />
			</div>
		)
	}

	return (
		<article>
			<MdxContent components={components} />
		</article>
	)
}

export const Content = memo(ContentBase)
