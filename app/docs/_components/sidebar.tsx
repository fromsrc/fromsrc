import type { SidebarFolder, SidebarItem, SidebarSection } from "fromsrc/client"
import { Sidebar as SidebarBase } from "fromsrc/client"
import {
	BookOpen,
	Cloud,
	Download,
	Globe,
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
	configuration: <Settings size={14} />,
	quickstart: <Rocket size={14} />,
	theming: <Palette size={14} />,
	ai: <Sparkles size={14} />,
	customization: <Sliders size={14} />,
	writing: <Pen size={14} />,
	search: <Search size={14} />,
	versioning: <Tags size={14} />,
	deploying: <Cloud size={14} />,
	i18n: <Globe size={14} />,
}

export async function Sidebar() {
	const rawNavigation = await getNavigation()

	const navigation: SidebarSection[] = []
	const referenceItems: (SidebarItem | SidebarFolder)[] = []

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
		} else {
			navigation.push({
				title: section.title === "introduction" ? "getting started" : section.title,
				items: section.items.map((item) => ({
					type: "item" as const,
					title: item.title,
					href: item.slug ? `/docs/${item.slug}` : "/docs",
					icon: icons[item.slug?.replace(/\//g, "") || "introduction"],
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
