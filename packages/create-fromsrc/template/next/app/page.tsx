import Link from "next/link"

export default function Home() {
	return (
		<main className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-4">docs</h1>
				<Link href="/docs" className="text-blue-400 hover:underline">
					view documentation
				</Link>
			</div>
		</main>
	)
}
