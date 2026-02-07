import Link from "next/link"

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-4">
			<h1 className="text-lg font-medium text-fg">not found</h1>
			<Link href="/" className="text-sm text-muted hover:text-fg transition-colors">
				home
			</Link>
		</div>
	)
}
