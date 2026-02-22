import type { MetadataRoute } from "next"
import { siteurl } from "./_lib/site"

export default function robots(): MetadataRoute.Robots {
	return {
			rules: [
				{ userAgent: "*", allow: "/" },
				{
					userAgent: "GPTBot",
					allow: [
						"/llms.txt",
						"/llms-full.txt",
						"/.well-known/llms.txt",
						"/.well-known/llms-full.txt",
						"/api/raw/",
						"/api/mcp",
					],
				},
				{
					userAgent: "ClaudeBot",
					allow: [
						"/llms.txt",
						"/llms-full.txt",
						"/.well-known/llms.txt",
						"/.well-known/llms-full.txt",
						"/api/raw/",
						"/api/mcp",
					],
				},
			],
			sitemap: `${siteurl()}/sitemap.xml`,
		}
}
