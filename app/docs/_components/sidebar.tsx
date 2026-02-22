import type { SidebarFolder, SidebarItem, SidebarSection } from "fromsrc/client"
import { Sidebar as SidebarBase } from "fromsrc/client"
import {
	BookOpen,
	Cloud,
	Download,
	Globe,
	Hash,
	Keyboard,
	Palette,
	Pen,
	Rocket,
	Search,
	Settings,
	Signpost,
	Sliders,
	Sparkles,
	Tags,
} from "lucide-react"
import type { ReactNode } from "react"
import { Logo } from "@/app/components/logo"
import { getNavigation } from "../_lib/content"

const icons: Record<string, ReactNode> = {
	introduction: <BookOpen size={14} />,
	installation: <Download size={14} />,
	quickstart: <Rocket size={14} />,
	configuration: <Settings size={14} />,
	theming: <Palette size={14} />,
	customization: <Sliders size={14} />,
	writing: <Pen size={14} />,
	navigation: <Signpost size={14} />,
	search: <Search size={14} />,
	ai: <Sparkles size={14} />,
	slugs: <Hash size={14} />,
	keyboard: <Keyboard size={14} />,
	versioning: <Tags size={14} />,
	deploying: <Cloud size={14} />,
	i18n: <Globe size={14} />,
}

export async function Sidebar() {
	const rawNavigation = await getNavigation()

	const navigation: SidebarSection[] = []
	const referenceItems: (SidebarItem | SidebarFolder)[] = []

	for (const section of rawNavigation) {
		const root = section.items.every((item) => !item.slug.includes("/"))
		if (root) {
			const items: SidebarItem[] = section.items.map((item) => {
				const slug = item.slug || "introduction"
				return {
					type: "item",
					title: item.title,
					href: item.slug ? `/docs/${item.slug}` : "/docs",
					icon: icons[slug],
				}
			})
			navigation.push({ title: section.title, items })
			continue
		}
		referenceItems.push({
			type: "folder",
			title: section.title,
			defaultOpen: false,
			items: section.items.map((item) => ({
				type: "item" as const,
				title: item.title,
				href: `/docs/${item.slug}`,
			})),
		})
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
