import { Logo } from "./logo"

export function Nav() {
	return (
		<nav className="fixed top-0 left-0 right-0 z-50 px-6" role="navigation" aria-label="main">
			<div className="mx-auto max-w-5xl rounded-b-2xl bg-[#111111]/95 backdrop-blur-sm border border-line/60 border-t-0 px-5 py-3 flex items-center justify-between">
				<a
					href="/"
					className="flex items-center gap-2 text-fg hover:text-accent transition-colors duration-200"
					aria-label="fromsrc home"
				>
					<div className="p-1.5 rounded-lg bg-surface border border-line">
						<Logo className="size-3.5" />
					</div>
					<span className="text-sm">fromsrc</span>
				</a>

				<div className="hidden md:flex items-center gap-6 text-xs text-muted">
					<a href="#why" className="hover:text-fg transition-colors duration-200">why</a>
					<a href="#features" className="hover:text-fg transition-colors duration-200">features</a>
					<a href="#ai" className="hover:text-fg transition-colors duration-200">ai</a>
				</div>

				<a
					href="/docs"
					className="text-xs text-bg bg-fg hover:bg-accent hover:text-white px-4 py-1.5 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg"
				>
					docs
				</a>
			</div>
		</nav>
	)
}
