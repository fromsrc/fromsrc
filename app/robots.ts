import type { MetadataRoute } from "next";

import { siteUrl } from "./_lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { allow: "/", userAgent: "*" },
      {
        allow: [
          "/llms.txt",
          "/llms-full.txt",
          "/.well-known/llms.txt",
          "/.well-known/llms-full.txt",
          "/api/raw/",
          "/api/mcp",
        ],
        userAgent: "GPTBot",
      },
      {
        allow: [
          "/llms.txt",
          "/llms-full.txt",
          "/.well-known/llms.txt",
          "/.well-known/llms-full.txt",
          "/api/raw/",
          "/api/mcp",
        ],
        userAgent: "ClaudeBot",
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
