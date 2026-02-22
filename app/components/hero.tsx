"use client"

import Link from "next/link"
import { useState } from "react"
import { Copy } from "./copy"
import { files, stats } from "./heroitems"
import { Bolt } from "./logo"

export function Hero() {
	const [active, setActive] = useState(0)
	const [copied, setCopied] = useState(false)
	const current = files[active]

	const copy = () => {
		if (!current) return
		navigator.clipboard.writeText(current.raw)
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
					<Link
						href="/docs"
						className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-full text-sm hover:bg-accent/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg"
					>
						<Bolt />
						introduction
					</Link>
					<Copy
						text="bunx create-fromsrc"
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
									id={`tab-${i}`}
									aria-selected={active === i}
									aria-controls="code-panel"
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
					<div className="p-6" role="tabpanel" id="code-panel" aria-labelledby={`tab-${active}`}>
						{current && (
							<div className="flex text-sm font-mono">
								<div
									className="pr-6 text-dim text-right select-none border-r border-line mr-6 leading-relaxed"
									aria-hidden="true"
								>
									{current.lines.map((line) => (
										<div key={line.num}>{line.num}</div>
									))}
								</div>
								<pre className="leading-relaxed">
									{current.lines.map((line) => (
										<div key={line.num}>{line.content}</div>
									))}
								</pre>
							</div>
						)}
					</div>
				</div>

				<div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
					{stats.map((stat) => (
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
