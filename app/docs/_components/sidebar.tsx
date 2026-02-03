import type { ReactNode } from "react"
import { Sidebar as SidebarBase } from "fromsrc/client"
import type { SidebarSection, SidebarItem, SidebarFolder } from "fromsrc/client"
import { getNavigation, getAllDocs } from "../_lib/content"
import { Logo } from "@/app/components/logo"

const icons: Record<string, ReactNode> = {
	introduction: (
		<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
			<path d="M0 1.75A.75.75 0 01.75 1h4.253c1.227 0 2.317.59 3 1.501A3.744 3.744 0 0111.006 1h4.245a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75h-4.507a2.25 2.25 0 00-1.591.659l-.622.621a.75.75 0 01-1.06 0l-.622-.621A2.25 2.25 0 005.258 13H.75a.75.75 0 01-.75-.75V1.75zm8.755 3a2.25 2.25 0 012.25-2.25H14.5v9h-3.757c-.71 0-1.4.201-1.992.572l.004-7.322zm-1.504 7.324l.004-5.073-.002-2.253A2.25 2.25 0 005.003 2.5H1.5v9h3.757a3.75 3.75 0 011.994.574z" />
		</svg>
	),
	installation: (
		<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
			<path d="M2.75 14A1.75 1.75 0 011 12.25v-2.5a.75.75 0 011.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25v-2.5a.75.75 0 011.5 0v2.5A1.75 1.75 0 0113.25 14H2.75z" />
			<path d="M7.25 7.689V2a.75.75 0 011.5 0v5.689l1.97-1.969a.749.749 0 111.06 1.06l-3.25 3.25a.749.749 0 01-1.06 0L4.22 6.78a.749.749 0 111.06-1.06l1.97 1.969z" />
		</svg>
	),
	configuration: (
		<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
			<path d="M8 0a8.2 8.2 0 01.701.031C12.268.348 15 3.417 15 7.165 15 11.564 11.552 15 7.331 15c-3.093 0-5.862-1.81-7.076-4.581a.5.5 0 01.468-.718h2.113c.197 0 .382.097.494.257l.838 1.199a.5.5 0 00.841-.052l1.863-3.978a.5.5 0 01.916.051l1.167 3.112a.5.5 0 00.898.072l1.042-1.449a.5.5 0 01.404-.206h2.36a.5.5 0 00.47-.673A7.165 7.165 0 008 0z" />
		</svg>
	),
	quickstart: (
		<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
			<path d="M9.504.43a1.516 1.516 0 011.014-.034l.005.002a1.462 1.462 0 01.864.817l.005.013 2.651 6.635a1.5 1.5 0 01-.811 1.973l-.011.004a1.51 1.51 0 01-1.978-.803l-.005-.012-.863-2.158-.076 7.042a1.5 1.5 0 01-1.532 1.471l-.013-.001a1.5 1.5 0 01-1.473-1.532l.001-.012.077-7.182-.92 2.346a1.5 1.5 0 01-1.923.867l-.013-.005a1.5 1.5 0 01-.867-1.923l.005-.013L6.12 1.185a1.5 1.5 0 01.881-.879l.012-.005a1.498 1.498 0 011.492.356l.006.006.987.989.012-1.18a.5.5 0 01.505-.494l.013.001a.5.5 0 01.493.505l-.017 1.615z" />
		</svg>
	),
	theming: (
		<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
			<path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" />
			<path d="M8 3a5 5 0 000 10V3z" />
		</svg>
	),
	ai: (
		<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
			<path d="M7.998 14.5c2.832 0 5-1.98 5-4.5 0-1.463-.68-2.19-1.879-3.383l-.036-.037c-1.013-1.008-2.3-2.29-2.834-4.434-.322.256-.63.579-.864.953-.432.696-.621 1.58-.046 2.73.473.947.67 2.284-.278 3.232-.61.61-1.545.84-2.403.633a2.79 2.79 0 01-1.436-.874A3.198 3.198 0 003 10c0 2.53 2.164 4.5 4.998 4.5zM9.533.753C9.496.34 9.16.009 8.77.146 7.035.75 4.34 3.187 5.997 6.5c.344.689.285 1.218.003 1.5-.419.419-1.54.487-2.04-.832-.173-.454-.659-.762-1.035-.454C2.036 7.44 1.5 8.702 1.5 10c0 3.512 2.998 6 6.498 6s6.5-2.5 6.5-6c0-2.137-1.128-3.26-2.312-4.438-1.19-1.184-2.436-2.425-2.653-4.81z" />
		</svg>
	),
	customization: (
		<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
			<path d="M8 4a4 4 0 100 8 4 4 0 000-8zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" />
			<path d="M8 10.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
		</svg>
	),
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
			logo={<Logo className="size-5" />}
			navigation={navigation}
			docs={docs}
			basePath="/docs"
			github="https://github.com/fromsrc/fromsrc"
			collapsible
		/>
	)
}
