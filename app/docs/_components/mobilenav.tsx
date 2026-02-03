import { MobileNav as MobileNavBase } from "fromsrc/client"
import { Logo } from "@/app/components/logo"
import { getAllDocs, getNavigation } from "../_lib/content"

export async function MobileNavigation() {
	const [navigation, docs] = await Promise.all([getNavigation(), getAllDocs()])

	return (
		<MobileNavBase
			title="fromsrc"
			logo={<Logo className="size-4" />}
			navigation={navigation}
			docs={docs}
			basePath="/docs"
			github="https://github.com/fromsrc/fromsrc"
		/>
	)
}
