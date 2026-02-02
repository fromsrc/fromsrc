import { Sidebar as SidebarBase } from "fromsrc/client"
import type { SidebarSection, SidebarItem, SidebarFolder } from "fromsrc/client"
import { getNavigation, getAllDocs } from "../_lib/content"
import { Logo } from "@/app/components/logo"

export async function Sidebar() {
	const rawNavigation = await getNavigation()
	const docs = await getAllDocs()

	const navigation: SidebarSection[] = rawNavigation.map((section) => {
		if (section.title === "components") {
			const folder: SidebarFolder = {
				type: "folder",
				title: "components",
				defaultOpen: false,
				items: section.items.map((item) => ({
					type: "item" as const,
					title: item.title,
					href: `/docs/${item.slug}`,
				})),
			}
			return { title: "reference", items: [folder] }
		}
		return {
			title: section.title,
			items: section.items.map((item) => ({
				type: "item" as const,
				title: item.title,
				href: item.slug ? `/docs/${item.slug}` : "/docs",
			})),
		}
	})

	return (
		<SidebarBase
			title="fromsrc"
			logo={<Logo className="size-5" />}
			navigation={navigation}
			docs={docs}
			basePath="/docs"
			github="https://github.com/fromsrc/fromsrc"
			collapsible
		/>
	)
}
