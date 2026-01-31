const parts = [
	{ name: "Sidebar", icon: "≡" },
	{ name: "TOC", icon: "#" },
	{ name: "Code", icon: ">" },
	{ name: "API", icon: "/" },
	{ name: "Callout", icon: "!" },
	{ name: "Tabs", icon: "□" },
	{ name: "Steps", icon: "→" },
	{ name: "Search", icon: "⌘" },
]

export function Parts() {
	return (
		<section className="py-20 border-t border-line">
			<div className="mx-auto max-w-5xl px-6">
				<div className="grid lg:grid-cols-[200px,1fr] gap-12 mb-16">
					<div>
						<span className="text-dim text-xs">04</span>
						<h2 className="text-xl mt-1">components</h2>
					</div>
					<p className="text-muted max-w-xl">
						Import, extend, or replace. No swizzling, no framework magic—just components.
					</p>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					{parts.map((p) => (
						<div 
							key={p.name} 
							className="group rounded-xl bg-surface border border-line p-5 hover:border-dim transition-colors text-center"
						>
							<div className="text-2xl text-dim group-hover:text-accent transition-colors mb-3">{p.icon}</div>
							<div className="text-fg text-sm">{p.name}</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
