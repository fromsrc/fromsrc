import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{ userAgent: "*", allow: "/" },
			{ userAgent: "GPTBot", allow: ["/llms.txt", "/llms-full.txt", "/api/raw/", "/api/mcp"] },
			{ userAgent: "ClaudeBot", allow: ["/llms.txt", "/llms-full.txt", "/api/raw/", "/api/mcp"] },
		],
		sitemap: "https://fromsrc.com/sitemap.xml",
	}
}
