import Link from "next/link"
import { Bolt, Logo } from "./logo"

type Link = {
	href: string
	label: string
}

const links: Record<string, Link[]> = {
	product: [
		{ href: "#why", label: "why fromsrc" },
		{ href: "#features", label: "features" },
		{ href: "#ai", label: "ai-native" },
	],
	resources: [
		{ href: "/docs", label: "docs" },
		{ href: "/docs/examples/index", label: "examples" },
		{ href: "/docs/components/changelog", label: "changelog" },
	],
	community: [
		{ href: "https://github.com/fromsrc", label: "github" },
		{ href: "https://twitter.com/fromsrc", label: "twitter" },
		{ href: "https://github.com/fromsrc/fromsrc/discussions", label: "discussions" },
	],
}

export function Foot() {
	return (
		<footer className="px-6 pt-24 pb-0">
			<div className="mx-auto max-w-5xl rounded-t-4xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-line border-b-0 px-8 py-12 md:px-12 md:py-16">
				<div className="mb-16">
					<h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
						Ready to build docs
						<br />
						<span className="text-muted">that don't fight you?</span>
					</h2>
					<div className="flex flex-wrap items-center gap-6">
						<Link
							href="/docs"
							className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-full text-sm hover:bg-accent/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg"
						>
							<Bolt />
							introduction
						</Link>
						<code className="text-muted">bunx create-fromsrc</code>
					</div>
				</div>

				<nav className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16" aria-label="footer">
					{Object.entries(links).map(([category, items]) => (
						<div key={category}>
							<div className="text-muted text-xs uppercase tracking-widest mb-4">{category}</div>
							<ul className="space-y-2 text-sm">
								{items.map((item) => (
									<li key={item.label}>
										<a
											href={item.href}
											className="block text-dim hover:text-fg transition-colors duration-200"
										>
											{item.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					))}
				</nav>

				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-8 border-t border-line/50">
					<div className="flex items-center gap-3">
						<Logo className="size-6 text-muted" />
						<div>
							<div className="text-fg text-sm">fromsrc</div>
							<p className="text-dim text-xs">mdx docs framework. ai-native. open source.</p>
						</div>
					</div>
					<div className="text-dim text-xs">2026 fromsrc</div>
				</div>
			</div>
		</footer>
	)
}
