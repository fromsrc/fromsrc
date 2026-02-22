import type { SidebarFolder, SidebarItem, SidebarSection } from "fromsrc/client"
import { getNavigation } from "../_lib/content"
import { SidebarClient } from "./sidebarclient"

export async function Sidebar() {
	const rawNavigation = await getNavigation()

	const navigation: SidebarSection[] = []
	const referenceItems: (SidebarItem | SidebarFolder)[] = []

	for (const section of rawNavigation) {
		const root = section.items.every((item) => !item.slug.includes("/"))
		if (root) {
			const items: SidebarItem[] = section.items.map((item) => {
				return {
					type: "item",
					title: item.title,
					href: item.slug ? `/docs/${item.slug}` : "/docs",
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

	return <SidebarClient navigation={navigation} />
}
