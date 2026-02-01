import { Logo, Bolt } from "./logo"

export function Foot() {
	return (
		<footer className="px-6 pt-20 pb-0">
			<div className="mx-auto max-w-5xl rounded-t-4xl bg-linear-to-b from-[#1a1a1a] to-[#0a0a0a] border border-line border-b-0 px-8 py-12 md:px-12 md:py-16">
				<div className="mb-16">
					<h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
						Ready to build docs<br />
						<span className="text-muted">that don't fight you?</span>
					</h2>
					<div className="flex flex-wrap items-center gap-6">
						<a
							href="/docs"
							className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-full text-sm hover:bg-accent/90 transition-colors"
						>
							<Bolt />
							introduction
						</a>
						<code className="text-muted">npx create-fromsrc</code>
					</div>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
					<div>
						<div className="text-muted text-xs uppercase tracking-widest mb-4">product</div>
						<div className="space-y-2 text-sm">
							<a href="#why" className="block text-dim hover:text-fg transition-colors">why fromsrc</a>
							<a href="#features" className="block text-dim hover:text-fg transition-colors">features</a>
							<a href="#ai" className="block text-dim hover:text-fg transition-colors">ai-native</a>
						</div>
					</div>
					<div>
						<div className="text-muted text-xs uppercase tracking-widest mb-4">resources</div>
						<div className="space-y-2 text-sm">
							<span className="block text-dim cursor-not-allowed">docs</span>
							<span className="block text-dim cursor-not-allowed">examples</span>
							<span className="block text-dim cursor-not-allowed">changelog</span>
						</div>
					</div>
					<div>
						<div className="text-muted text-xs uppercase tracking-widest mb-4">community</div>
						<div className="space-y-2 text-sm">
							<a href="https://github.com/fromsrc" className="block text-dim hover:text-fg transition-colors">github</a>
							<a href="https://twitter.com/fromsrc" className="block text-dim hover:text-fg transition-colors">twitter</a>
							<span className="block text-dim cursor-not-allowed">discord</span>
						</div>
					</div>
					<div>
						<div className="text-muted text-xs uppercase tracking-widest mb-4">legal</div>
						<div className="space-y-2 text-sm">
							<span className="block text-dim cursor-not-allowed">privacy</span>
							<span className="block text-dim cursor-not-allowed">terms</span>
						</div>
					</div>
				</div>

				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-8 border-t border-line/50">
					<div className="flex items-center gap-3">
						<Logo className="size-6 text-muted" />
						<div>
							<div className="text-fg text-sm">fromsrc</div>
							<p className="text-dim text-xs">mdx docs framework. ai-native. open source.</p>
						</div>
					</div>
					<div className="text-dim text-xs">
						© 2026 fromsrc
					</div>
				</div>
			</div>
		</footer>
	)
}
