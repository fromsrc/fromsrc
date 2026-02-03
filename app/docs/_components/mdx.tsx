import rehypeShiki from "@shikijs/rehype"
import {
	transformerNotationDiff,
	transformerNotationFocus,
	transformerNotationHighlight,
} from "@shikijs/transformers"
import type { ShikiTransformerContext } from "@shikijs/types"
import {
	Accordion,
	AccordionItem,
	Alert,
	Avatar,
	AvatarGroup,
	AvatarStack,
	Badge,
	Banner,
	BlockMath,
	BulletItem,
	BulletList,
	Callout,
	Card,
	Cards,
	Change,
	Changelog,
	CheckItem,
	CheckList,
	CodeBlock,
	CodeGroup,
	CodeSandbox,
	CodeTab,
	CodeTabs,
	Collapsible,
	Column,
	Command,
	Compare,
	CompareRow,
	Copyable,
	CopyBlock,
	Countdown,
	Create,
	Definition,
	DefinitionList,
	Details,
	Divider,
	Dropdown,
	Endpoint,
	Experimental,
	Feature,
	FeatureCard,
	Features,
	Feedback,
	File,
	Files,
	Flex,
	Folder,
	Frame,
	Gist,
	Github,
	Glossary,
	GlossaryItem,
	Graph,
	Grid,
	Highlight,
	HoverInfo,
	Important,
	InlineMath,
	Install,
	Kbd,
	LanguageSwitch,
	Line,
	LinkCard,
	LinkCards,
	Loading,
	Math,
	Mermaid,
	Modal,
	Note,
	NumberItem,
	NumberList,
	Output,
	Pagination,
	Param,
	Popover,
	Progress,
	ProgressSteps,
	Properties,
	Property,
	Quote,
	Rating,
	Release,
	Response,
	Screenshot,
	ScrollProgress,
	Shortcut,
	Show,
	Skeleton,
	SkeletonCard,
	SkeletonText,
	Spinner,
	StackBlitz,
	Status,
	StatusDot,
	Step,
	Steps,
	Tab,
	TabNav,
	TabNavDropdown,
	Tabs,
	Tag,
	Tags,
	Terminal,
	Testimonial,
	Testimonials,
	TocInline,
	Tooltip,
	Tweet,
	Typed,
	TypePopup,
	TypeTable,
	Typewriter,
	Underline,
	User,
	VersionSelect,
	Video,
	YouTube,
	Zoom,
} from "fromsrc/client"
import { MDXRemote } from "next-mdx-remote/rsc"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import remarkGfm from "remark-gfm"

type HeadingProps = ComponentPropsWithoutRef<"h1"> & { children?: ReactNode }
type CodeProps = ComponentPropsWithoutRef<"code"> & { children?: ReactNode }
type PreProps = ComponentPropsWithoutRef<"pre"> & {
	children?: ReactNode
	"data-language"?: string
}

function getId(children: ReactNode): string {
	if (typeof children === "string") {
		return children.toLowerCase().replace(/\s+/g, "-")
	}
	return ""
}

const components = {
	h2: (props: HeadingProps) => <h2 id={getId(props.children)} {...props} />,
	h3: (props: HeadingProps) => <h3 id={getId(props.children)} {...props} />,
	h4: (props: HeadingProps) => <h4 id={getId(props.children)} {...props} />,
	code: (props: CodeProps) => {
		const text = typeof props.children === "string" ? props.children : ""
		const isInline = typeof props.children === "string" && !text.includes("\n")
		if (!isInline) return <code {...props} />
		return <code {...props} />
	},
	pre: (props: PreProps) => {
		const lang = props["data-language"] || ""
		return (
			<CodeBlock lang={lang}>
				<pre {...props} />
			</CodeBlock>
		)
	},
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
	Kbd,
	Shortcut,
	Math,
	BlockMath,
	InlineMath,
	Endpoint,
	Param,
	Response,
	Screenshot,
	Frame,
	Property,
	Properties,
	Note,
	Important,
	Experimental,
	Changelog,
	Release,
	Change,
	Collapsible,
	Details,
	Terminal,
	Line,
	Output,
	Typed,
	YouTube,
	CodeSandbox,
	StackBlitz,
	Tweet,
	Gist,
	Quote,
	Testimonials,
	Testimonial,
	Compare,
	Column,
	CompareRow,
	Feature,
	Features,
	FeatureCard,
	Feedback,
	Graph,
	LanguageSwitch,
	Copyable,
	CopyBlock,
	DefinitionList,
	Definition,
	Glossary,
	GlossaryItem,
	Avatar,
	AvatarGroup,
	User,
	LinkCard,
	LinkCards,
	Status,
	StatusDot,
	Pagination,
	VersionSelect,
	Divider,
	Progress,
	ProgressSteps,
	Tag,
	Tags,
	CheckList,
	CheckItem,
	BulletList,
	BulletItem,
	NumberList,
	NumberItem,
	TabNav,
	TabNavDropdown,
	Show,
	Grid,
	Flex,
	Alert,
	AvatarStack,
	Command,
	Countdown,
	Dropdown,
	Highlight,
	HoverInfo,
	Loading,
	Modal,
	Popover,
	Rating,
	ScrollProgress,
	Skeleton,
	SkeletonCard,
	SkeletonText,
	Spinner,
	TypePopup,
	Typewriter,
	Underline,
}

interface Props {
	source: string
}

export async function MDX({ source }: Props) {
	return (
		<MDXRemote
			source={source}
			components={components}
			options={{
				mdxOptions: {
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
										pre(
											this: ShikiTransformerContext,
											node: { properties: Record<string, string> },
										) {
											const lang = this.options.lang || ""
											if (lang) {
												node.properties["data-language"] = lang
											}
										},
									},
								],
							},
						],
					],
				},
			}}
		/>
	)
}
