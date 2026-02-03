import { Sidebar as SidebarBase } from "fromsrc/client"
import type { SidebarSection, SidebarItem, SidebarFolder } from "fromsrc/client"
import { getNavigation, getAllDocs } from "../_lib/content"
import { Logo } from "@/app/components/logo"
import {
	BookOpen,
	Download,
	Settings,
	Rocket,
	Palette,
	Sparkles,
	Sliders,
} from "lucide-react"

const icons: Record<string, React.ReactNode> = {
	introduction: <BookOpen size={14} />,
	installation: <Download size={14} />,
	configuration: <Settings size={14} />,
	quickstart: <Rocket size={14} />,
	theming: <Palette size={14} />,
	ai: <Sparkles size={14} />,
	customization: <Sliders size={14} />,
}

export async function Sidebar() {
	const rawNavigation = await getNavigation()
	const docs = await getAllDocs()

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
				title: section.title,
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
			docs={docs}
			basePath="/docs"
			github="https://github.com/fromsrc/fromsrc"
			collapsible
		/>
	)
}
