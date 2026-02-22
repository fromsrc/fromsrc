"use client"

import type { SidebarSection } from "fromsrc/client"
import { Sidebar } from "fromsrc/client"
import { Logo } from "@/app/components/logo"

interface Props {
	navigation: SidebarSection[]
}

export function SidebarClient({ navigation }: Props) {
	return (
		<Sidebar
			title="fromsrc"
			logo={<Logo className="size-[18px]" />}
			navigation={navigation}
			basePath="/docs"
			github="https://github.com/fromsrc/fromsrc"
			collapsible
		/>
	)
}
