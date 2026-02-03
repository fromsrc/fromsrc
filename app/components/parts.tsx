const parts = [
	{ name: "Sidebar", icon: "=" },
	{ name: "TOC", icon: "#" },
	{ name: "Code", icon: ">" },
	{ name: "API", icon: "/" },
	{ name: "Callout", icon: "!" },
	{ name: "Tabs", icon: "[]" },
	{ name: "Steps", icon: "->" },
	{ name: "Search", icon: "?" },
]

export function Parts() {
	return (
		<section className="py-24 border-t border-line">
			<div className="mx-auto max-w-5xl px-6">
				<header className="grid lg:grid-cols-[200px,1fr] gap-12 mb-16">
					<div>
						<span className="text-dim text-xs">04</span>
						<h2 className="text-xl mt-1">components</h2>
					</div>
					<p className="text-muted max-w-xl">
						Import, extend, or replace. No swizzling, no framework magic - just components.
					</p>
				</header>

				<ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
					{parts.map((p) => (
						<li
							key={p.name}
							className="group rounded-xl bg-surface border border-line p-5 hover:border-dim transition-colors duration-200 text-center"
						>
							<div
								className="text-2xl text-dim group-hover:text-accent transition-colors duration-200 mb-3 font-mono"
								aria-hidden="true"
							>
								{p.icon}
							</div>
							<div className="text-fg text-sm">{p.name}</div>
						</li>
					))}
				</ul>
			</div>
		</section>
	)
}
