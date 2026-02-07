import Link from "next/link"

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
			<h2 className="text-lg font-medium text-fg">page not found</h2>
			<Link
				href="/docs"
				className="text-sm text-muted hover:text-fg transition-colors"
			>
				back to docs
			</Link>
		</div>
	)
}
