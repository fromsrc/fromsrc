const endpoints = [
	{ path: "/api/raw/auth", desc: "raw markdown" },
	{ path: "/api/llms/auth", desc: "ai-optimized" },
	{ path: "/llms.txt", desc: "all docs" },
	{ path: "/api/mcp", desc: "real-time" },
]

export function Native() {
	return (
		<section id="ai" className="py-24 border-t border-line">
			<div className="mx-auto max-w-5xl px-6">
				<header className="grid lg:grid-cols-[200px,1fr] gap-12 mb-16">
					<div>
						<span className="text-dim text-xs">03</span>
						<h2 className="text-xl mt-1">ai-native</h2>
					</div>
					<p className="text-muted max-w-xl">
						Every docs page has raw content endpoints. Feed pages to AI tools, get docs for RAG, or
						connect via MCP.
					</p>
				</header>

				<div className="grid lg:grid-cols-2 gap-6">
					<ul className="space-y-3">
						{endpoints.map((e) => (
							<li
								key={e.path}
								className="flex items-center justify-between rounded-xl bg-surface border border-line px-5 py-4 hover:border-dim transition-colors duration-200"
							>
								<code className="text-accent text-sm">{e.path}</code>
								<span className="text-muted text-xs">{e.desc}</span>
							</li>
						))}
					</ul>

					<div className="rounded-2xl bg-surface border border-line p-5 text-sm flex flex-col justify-between">
						<div className="space-y-4">
							<div className="flex gap-3">
								<span className="text-muted" aria-hidden="true">
									$
								</span>
								<code>curl https://your-docs.com/api/llms/auth</code>
							</div>
							<div className="pl-6 text-muted border-l border-line">
								<p className="text-dim"># Authentication</p>
								<p>Secure your API with bearer tokens.</p>
								<p className="text-dim mt-2"># OAuth 2.0</p>
								<p>Configure OAuth providers for SSO...</p>
							</div>
						</div>
						<div className="flex items-center justify-between pt-4 border-t border-line text-xs mt-4">
							<span className="text-muted">Content-Type: text/plain</span>
							<span className="text-accent">200 OK</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
