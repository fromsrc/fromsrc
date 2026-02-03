import type { ReactNode } from "react"

export interface AvatarProps {
	src?: string
	name: string
	size?: "sm" | "md" | "lg"
}

export interface AvatarGroupProps {
	children: ReactNode
	label: string
}

export interface UserProps {
	name: string
	avatar?: string
	role?: string
}

export interface ReleaseProps {
	version: string
	date?: string
	datetime?: string
	children: ReactNode
}

export type ChangeType = "added" | "changed" | "fixed" | "removed" | "deprecated" | "security"

export interface ChangeProps {
	type: ChangeType
	children: ReactNode
}

export interface ChangelogProps {
	children: ReactNode
}

export interface CollapsibleProps {
	title: string
	defaultOpen?: boolean
	children: ReactNode
}

export interface DetailsProps {
	summary: string
	children: ReactNode
}

export type CompareVariant = "default" | "good" | "bad"

export interface CompareProps {
	children: ReactNode
	label?: string
}

export interface ColumnProps {
	title: string
	variant?: CompareVariant
	children: ReactNode
}

export interface CompareRowProps {
	left: ReactNode
	right: ReactNode
	leftLabel?: string
	rightLabel?: string
}

export interface CopyableProps {
	value: string
	label?: string
}

export interface CopyBlockProps {
	children: string
}

export interface ContentProps {
	source: string
}

export interface CreateProps {
	package?: string
}

export interface DividerProps {
	label?: string
	className?: string
}

export interface YouTubeProps {
	id: string
	title?: string
}

export interface CodeSandboxProps {
	id: string
	title?: string
}

export interface StackBlitzProps {
	id: string
	file?: string
	title?: string
}

export interface TweetProps {
	id: string
}

export interface GistProps {
	id: string
	file?: string
	title?: string
}

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface FeatureProps {
	icon?: ReactNode
	title: string
	children: ReactNode
}

export interface FeaturesProps {
	children: ReactNode
	columns?: 2 | 3
}

export interface FeatureCardProps {
	icon?: ReactNode
	title: string
	children: ReactNode
}

export interface IconProps {
	className?: string
	size?: number
	fill?: string
}

export interface InstallProps {
	package: string
}

export interface LinkCardProps {
	href: string
	title: string
	description?: string
	icon?: ReactNode
}

export interface LinkCardsProps {
	children: ReactNode
}

export interface CheckItemProps {
	checked?: boolean
	children: ReactNode
}

export interface BulletItemProps {
	children: ReactNode
}

export interface NumberListProps {
	start?: number
	children: ReactNode
}

export interface NumberItemProps {
	number: number
	children: ReactNode
}

export interface MathProps {
	children: ReactNode
	display?: boolean
}

export interface BlockMathProps {
	children: ReactNode
}

export interface InlineMathProps {
	children: ReactNode
}

export interface NoteProps {
	children: ReactNode
	className?: string
	label?: string
}

export interface PropertyProps {
	name: string
	type: string
	required?: boolean
	default?: ReactNode
	deprecated?: boolean
	children?: ReactNode
}

export interface PropertiesProps {
	children: ReactNode
}

export interface QuoteProps {
	children: ReactNode
	author?: string
	role?: string
	avatar?: string
}

export interface TestimonialsProps {
	children: ReactNode
}

export interface TestimonialProps {
	children: ReactNode
	author: string
	role?: string
	avatar?: string
}

export interface ScreenshotProps {
	src: string
	alt: string
	caption?: string
	browser?: boolean
	className?: string
}

export interface FrameProps {
	children: ReactNode
	title?: string
	className?: string
}

export type StatusType = "success" | "warning" | "error" | "info" | "neutral"

export interface StatusProps {
	type?: StatusType
	children: string
}

export interface StatusDotProps {
	type?: StatusType
	label?: string
	pulse?: boolean
}

export interface TerminalProps {
	title?: string
	children: ReactNode
}

export interface LineProps {
	prompt?: string
	children: ReactNode
}

export interface OutputProps {
	children: ReactNode
}

export interface TypedProps {
	text: string
	speed?: number
}

export interface BackToTopProps {
	threshold?: number
	className?: string
}

export interface NavLinkProps {
	href: string
	children: ReactNode
	icon?: ReactNode
	onClick?: () => void
	external?: boolean
}

export interface CodeBlockProps {
	children: ReactNode
	lang?: string
	title?: string
}

export interface MobileNavProps {
	title: string
	logo?: ReactNode
	navigation: SidebarSection[]
	docs: DocMeta[]
	basePath?: string
	github?: string
}

export interface SidebarSection {
	title: string
	items: (SidebarItem | SidebarFolder | DocMeta)[]
}

export interface SidebarItem {
	type: "item"
	title: string
	href: string
	icon?: ReactNode
}

export interface SidebarFolder {
	type: "folder"
	title: string
	href?: string
	icon?: ReactNode
	defaultOpen?: boolean
	items: (SidebarItem | SidebarFolder)[]
}

export interface DocMeta {
	slug: string
	title: string
	description?: string
}
