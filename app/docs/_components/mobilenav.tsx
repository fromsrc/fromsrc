import { MobileNav as MobileNavBase } from "fromsrc/client"
import { getNavigation, getAllDocs } from "../_lib/content"
import { Logo } from "@/app/components/logo"

export async function MobileNavigation() {
	const navigation = await getNavigation()
	const docs = await getAllDocs()

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
