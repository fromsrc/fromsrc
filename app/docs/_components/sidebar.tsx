import type { SidebarFolder, SidebarItem, SidebarSection } from "fromsrc/client"
import { Sidebar as SidebarBase } from "fromsrc/client"
import {
	BookOpen,
	Cloud,
	Download,
	Globe,
	Hash,
	Palette,
	Pen,
	Rocket,
	Search,
	Settings,
	Sliders,
	Sparkles,
	Tags,
} from "lucide-react"
import { Logo } from "@/app/components/logo"
import { getNavigation } from "../_lib/content"

const icons: Record<string, React.ReactNode> = {
	introduction: <BookOpen size={14} />,
	installation: <Download size={14} />,
	quickstart: <Rocket size={14} />,
	configuration: <Settings size={14} />,
	theming: <Palette size={14} />,
	customization: <Sliders size={14} />,
	writing: <Pen size={14} />,
	search: <Search size={14} />,
	ai: <Sparkles size={14} />,
	slugs: <Hash size={14} />,
	versioning: <Tags size={14} />,
	deploying: <Cloud size={14} />,
	i18n: <Globe size={14} />,
}

const sections: Record<string, string[]> = {
	"getting started": ["", "installation", "quickstart"],
	basics: ["configuration", "theming", "customization", "writing"],
	features: ["search", "ai", "slugs", "versioning"],
	production: ["deploying", "i18n"],
}

export async function Sidebar() {
	const rawNavigation = await getNavigation()

	const navigation: SidebarSection[] = []
	const referenceItems: (SidebarItem | SidebarFolder)[] = []

	const introItems = rawNavigation.find((s) => s.title === "introduction")?.items || []
	const itemMap = new Map(introItems.map((item) => [item.slug, item]))

	for (const [sectionTitle, slugs] of Object.entries(sections)) {
		const items: SidebarItem[] = []
		for (const slug of slugs) {
			const item = itemMap.get(slug)
			if (item) {
				items.push({
					type: "item",
					title: item.title,
					href: slug ? `/docs/${slug}` : "/docs",
					icon: icons[slug || "introduction"],
				})
			}
		}
		if (items.length > 0) {
			navigation.push({ title: sectionTitle, items })
		}
	}

	for (const section of rawNavigation) {
		if (section.title === "components") {
			referenceItems.push({
				type: "folder",
				title: "components",
				defaultOpen: false,
				items: section.items.map((item) => ({
					type: "item" as const,
					title: item.title,
					href: `/docs/${item.slug}`,
				})),
			})
		} else if (section.title === "api") {
			referenceItems.push({
				type: "folder",
				title: "api",
				defaultOpen: false,
				items: section.items.map((item) => ({
					type: "item" as const,
					title: item.title,
					href: `/docs/${item.slug}`,
				})),
			})
		} else if (section.title === "examples") {
			referenceItems.push({
				type: "folder",
				title: "examples",
				defaultOpen: false,
				items: section.items.map((item) => ({
					type: "item" as const,
					title: item.title,
					href: `/docs/${item.slug}`,
				})),
			})
		}
	}

	if (referenceItems.length > 0) {
		navigation.push({ title: "reference", items: referenceItems })
	}

	return (
		<SidebarBase
			title="fromsrc"
			logo={<Logo className="size-[18px]" />}
			navigation={navigation}
			basePath="/docs"
			github="https://github.com/fromsrc/fromsrc"
			collapsible
		/>
	)
}
