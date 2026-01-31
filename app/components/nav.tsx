import { Logo } from "./logo"

export function Nav() {
	return (
		<nav className="fixed top-0 left-0 right-0 z-50 px-6">
			<div className="mx-auto max-w-5xl rounded-b-2xl bg-[#111111] border border-line/60 border-t-0 px-5 py-3 flex items-center justify-between">
				<a href="/" className="flex items-center gap-2 text-fg hover:text-accent transition-colors">
					<div className="p-1.5 rounded-lg bg-surface border border-line">
						<Logo className="size-3.5" />
					</div>
					<span className="text-sm">fromsrc</span>
				</a>

				<div className="hidden md:flex items-center gap-6 text-xs text-muted">
					<a href="#why" className="hover:text-fg transition-colors">why</a>
					<a href="#features" className="hover:text-fg transition-colors">features</a>
					<a href="#ai" className="hover:text-fg transition-colors">ai</a>
				</div>
				
				<a
					href="/docs"
					className="text-xs text-bg bg-fg hover:bg-accent px-4 py-1.5 rounded-lg transition-colors"
				>
					docs
				</a>
			</div>
		</nav>
	)
}
