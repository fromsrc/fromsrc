"use client"

import { useState } from "react"
import { Copy } from "./copy"
import { Bolt } from "./logo"

const files = [
	{
		name: "docs/auth.mdx",
		lines: [
			{
				num: 1,
				content: (
					<>
						<span className="text-dim">---</span>
					</>
				),
			},
			{
				num: 2,
				content: (
					<>
						<span className="text-muted">title:</span>{" "}
						<span className="text-fg">Authentication</span>
					</>
				),
			},
			{
				num: 3,
				content: (
					<>
						<span className="text-dim">---</span>
					</>
				),
			},
			{ num: 4, content: <>&nbsp;</> },
			{
				num: 5,
				content: (
					<>
						<span className="text-accent">import</span>{" "}
						<span className="text-fg">{"{ ApiEndpoint }"}</span>{" "}
						<span className="text-accent">from</span>{" "}
						<span className="text-muted">"@/components"</span>
					</>
				),
			},
			{ num: 6, content: <>&nbsp;</> },
			{
				num: 7,
				content: (
					<>
						<span className="text-muted"># OAuth 2.0</span>
					</>
				),
			},
			{ num: 8, content: <>&nbsp;</> },
			{ num: 9, content: <>Configure OAuth providers for SSO.</> },
			{ num: 10, content: <>&nbsp;</> },
			{
				num: 11,
				content: (
					<>
						<span className="text-dim">{"<"}</span>
						<span className="text-fg">ApiEndpoint</span> <span className="text-muted">method=</span>
						<span className="text-accent">"POST"</span> <span className="text-muted">path=</span>
						<span className="text-accent">"/auth/token"</span>{" "}
						<span className="text-dim">/{">"}</span>
					</>
				),
			},
		],
		raw: `---
title: Authentication
---

import { ApiEndpoint } from "@/components"

# OAuth 2.0

Configure OAuth providers for SSO.

<ApiEndpoint method="POST" path="/auth/token" />`,
	},
	{
		name: "fromsrc.config.ts",
		lines: [
			{
				num: 1,
				content: (
					<>
						<span className="text-accent">import</span>{" "}
						<span className="text-fg">{"{ defineConfig }"}</span>{" "}
						<span className="text-accent">from</span> <span className="text-muted">"fromsrc"</span>
					</>
				),
			},
			{ num: 2, content: <>&nbsp;</> },
			{
				num: 3,
				content: (
					<>
						<span className="text-accent">export default</span>{" "}
						<span className="text-fg">defineConfig</span>
						<span className="text-dim">({"{"}</span>
					</>
				),
			},
			{
				num: 4,
				content: (
					<>
						&nbsp;&nbsp;<span className="text-muted">title:</span>{" "}
						<span className="text-accent">"My Docs"</span>,
					</>
				),
			},
			{
				num: 5,
				content: (
					<>
						&nbsp;&nbsp;<span className="text-muted">description:</span>{" "}
						<span className="text-accent">"API documentation"</span>,
					</>
				),
			},
			{
				num: 6,
				content: (
					<>
						&nbsp;&nbsp;<span className="text-muted">llmsTxt:</span>{" "}
						<span className="text-fg">true</span>,
					</>
				),
			},
			{
				num: 7,
				content: (
					<>
						&nbsp;&nbsp;<span className="text-muted">mcp:</span>{" "}
						<span className="text-fg">true</span>,
					</>
				),
			},
			{
				num: 8,
				content: (
					<>
						&nbsp;&nbsp;<span className="text-muted">search:</span>{" "}
						<span className="text-dim">{"{"}</span> <span className="text-muted">provider:</span>{" "}
						<span className="text-accent">"orama"</span> <span className="text-dim">{"}"}</span>,
					</>
				),
			},
			{
				num: 9,
				content: (
					<>
						&nbsp;&nbsp;<span className="text-muted">theme:</span>{" "}
						<span className="text-dim">{"{"}</span> <span className="text-muted">accent:</span>{" "}
						<span className="text-accent">"#ef4444"</span> <span className="text-dim">{"}"}</span>,
					</>
				),
			},
			{
				num: 10,
				content: (
					<>
						&nbsp;&nbsp;<span className="text-muted">sidebar:</span>{" "}
						<span className="text-dim">{"{"}</span> <span className="text-muted">collapsed:</span>{" "}
						<span className="text-fg">false</span> <span className="text-dim">{"}"}</span>,
					</>
				),
			},
			{
				num: 11,
				content: (
					<>
						<span className="text-dim">{"}"})</span>
					</>
				),
			},
		],
		raw: `import { defineConfig } from "fromsrc"

export default defineConfig({
  title: "My Docs",
  description: "API documentation",
  llmsTxt: true,
  mcp: true,
  search: { provider: "orama" },
  theme: { accent: "#ef4444" },
  sidebar: { collapsed: false },
})`,
	},
]

export function Hero() {
	const [active, setActive] = useState(0)
	const [copied, setCopied] = useState(false)

	const copy = () => {
		navigator.clipboard.writeText(files[active].raw)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<section className="pt-28 pb-20 animate-fadein">
			<div className="mx-auto max-w-5xl px-6">
				<header className="max-w-3xl mb-16">
					<p className="text-muted text-xs uppercase tracking-widest mb-6">
						documentation framework
					</p>
					<h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-8 tracking-tight">
						MDX with full control_
					</h1>
					<p className="text-muted text-lg leading-relaxed max-w-xl">
						No content layer abstraction. Incremental builds that don't choke at scale. llms.txt and
						MCP support built-in.
					</p>
				</header>

				<div className="flex items-center gap-6 mb-20">
					<a
						href="/docs"
						className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-full text-sm hover:bg-accent/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg"
					>
						<Bolt />
						introduction
					</a>
					<Copy
						text="npx create-fromsrc"
						className="text-xs underline underline-offset-4 shimmer"
					/>
				</div>

				<div className="group rounded-2xl bg-surface border border-line overflow-hidden">
					<div className="flex items-center justify-between px-4 py-2 border-b border-line">
						<div className="flex items-center gap-1" role="tablist">
							{files.map((file, i) => (
								<button
									key={file.name}
									type="button"
									role="tab"
									aria-selected={active === i}
									onClick={() => setActive(i)}
									className={`px-3 py-1.5 text-xs rounded-md transition-colors duration-200 ${
										active === i ? "bg-line text-fg" : "text-muted hover:text-fg"
									}`}
								>
									{file.name}
								</button>
							))}
						</div>
						<button
							type="button"
							onClick={copy}
							aria-label={copied ? "copied" : "copy code"}
							className="text-xs text-muted hover:text-fg transition-all duration-200 opacity-0 group-hover:opacity-100"
						>
							{copied ? "copied!" : "copy"}
						</button>
					</div>
					<div className="p-6" role="tabpanel">
						<div className="flex text-sm font-mono">
							<div
								className="pr-6 text-dim text-right select-none border-r border-line mr-6 leading-relaxed"
								aria-hidden="true"
							>
								{files[active].lines.map((line) => (
									<div key={line.num}>{line.num}</div>
								))}
							</div>
							<pre className="leading-relaxed">
								{files[active].lines.map((line) => (
									<div key={line.num}>{line.content}</div>
								))}
							</pre>
						</div>
					</div>
				</div>

				<div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
					{[
						{ value: "<20ms", label: "search" },
						{ value: "3k+", label: "files ok" },
						{ value: "0", label: "abstraction" },
						{ value: "100%", label: "open source" },
					].map((stat) => (
						<div key={stat.label} className="py-4 border-l border-line pl-4">
							<div className="text-2xl tabular-nums mb-1">{stat.value}</div>
							<div className="text-muted text-xs">{stat.label}</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
