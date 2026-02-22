import type { SidebarItem, SidebarSection } from "fromsrc/client"
import { getNavigation } from "../_lib/content"
import { SidebarClient } from "./sidebarclient"

export async function Sidebar() {
	const rawNavigation = await getNavigation()

	const navigation: SidebarSection[] = []

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
		const items: SidebarItem[] = section.items.map((item) => ({
			type: "item",
			title: item.title,
			href: `/docs/${item.slug}`,
		}))
		navigation.push({ title: section.title, items })
	}

	return <SidebarClient navigation={navigation} />
}
