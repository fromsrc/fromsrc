import { Sidebar as SidebarBase } from "fromsrc/client"
import { getNavigation, getAllDocs } from "../_lib/content"
import { Logo } from "@/app/components/logo"

export async function Sidebar() {
	const navigation = await getNavigation()
	const docs = await getAllDocs()

	return (
		<SidebarBase
			title="fromsrc"
			logo={<Logo className="size-5" />}
			navigation={navigation}
			docs={docs}
			basePath="/docs"
			github="https://github.com/fromsrc/fromsrc"
		/>
	)
}
