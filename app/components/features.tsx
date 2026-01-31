const features = [
	{
		id: "01",
		title: "incremental builds",
		desc: "only rebuild what changed. no 20-minute builds or memory crashes.",
	},
	{
		id: "02",
		title: "direct imports",
		desc: "import any component into mdx. no content layer abstraction.",
	},
	{
		id: "03",
		title: "sub-20ms search",
		desc: "full-text search with fuzzy matching and keyboard navigation.",
	},
	{
		id: "04",
		title: "shiki highlighting",
		desc: "vs code quality syntax. dual themes. line highlighting. diffs.",
	},
	{
		id: "05",
		title: "openapi generation",
		desc: "generate interactive api reference from your openapi spec.",
	},
	{
		id: "06",
		title: "own your primitives",
		desc: "sidebar, toc, code blocks. swap, style, or replace anything.",
	},
]

export function Features() {
	return (
		<section id="features" className="py-20 border-t border-line">
			<div className="mx-auto max-w-5xl px-6">
				<div className="grid lg:grid-cols-[200px,1fr] gap-12 mb-16">
					<div>
						<span className="text-dim text-xs">02</span>
						<h2 className="text-xl mt-1">features</h2>
					</div>
					<p className="text-muted max-w-xl">
						Built from developer pain points. No swizzling, no magic, no vendor lock-in.
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
					{features.map((f) => (
						<div 
							key={f.id} 
							className="group rounded-2xl bg-surface border border-line p-6 hover:border-dim transition-colors"
						>
							<span className="text-dim text-xs">{f.id}</span>
							<h3 className="text-fg mt-3 mb-2 group-hover:text-accent transition-colors">{f.title}</h3>
							<p className="text-muted text-xs leading-relaxed">{f.desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
