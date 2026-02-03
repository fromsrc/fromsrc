const principles = [
	{ id: "1.1", title: "composable", desc: "small pieces that combine freely. no monolithic architecture." },
	{ id: "1.2", title: "editable", desc: "change anything without fighting the framework." },
	{ id: "1.3", title: "customizable", desc: "swap any component, style, or behavior." },
	{ id: "1.4", title: "optimized", desc: "incremental builds only. scales to thousands of files." },
]

const benefits = [
	"direct component access in mdx",
	"incremental builds only",
	"llms.txt + mcp built-in",
	"sub-20ms search",
	"scales to 3k+ files",
	"open source forever",
]

export function Compare() {
	return (
		<section id="why" className="py-24 border-t border-line">
			<div className="mx-auto max-w-5xl px-6">
				<header className="grid lg:grid-cols-[200px,1fr] gap-12 mb-16">
					<div>
						<span className="text-dim text-xs">01</span>
						<h2 className="text-xl mt-1">why fromsrc</h2>
					</div>
					<p className="text-muted max-w-xl">
						Documentation should be as flexible as the code it describes.
						We built fromsrc around four principles.
					</p>
				</header>

				<div className="grid lg:grid-cols-2 gap-8">
					<div className="rounded-2xl bg-surface border border-line p-6">
						<div className="text-xs text-muted uppercase tracking-widest mb-6">principles</div>
						<ul>
							{principles.map((p) => (
								<li key={p.id} className="flex items-start gap-4 py-4 border-b border-line last:border-0">
									<span className="text-dim text-xs tabular-nums w-6">{p.id}</span>
									<div className="flex-1">
										<span className="text-fg">{p.title}</span>
										<p className="text-muted text-xs mt-1">{p.desc}</p>
									</div>
								</li>
							))}
						</ul>
					</div>

					<div className="rounded-2xl border border-line p-6 bg-linear-to-br from-surface to-bg">
						<div className="text-xs text-accent uppercase tracking-widest mb-6">what you get</div>
						<ul>
							{benefits.map((b) => (
								<li key={b} className="flex items-center gap-4 py-4 border-b border-line last:border-0">
									<span className="text-accent" aria-hidden="true">+</span>
									<span className="text-fg">{b}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	)
}
