export default function Docs() {
	return (
		<main className="max-w-3xl mx-auto py-16 px-4">
			<h1 className="text-3xl font-bold mb-4">getting started</h1>
			<p className="text-neutral-400 mb-8">
				welcome to your documentation site powered by fromsrc.
			</p>
			<h2 className="text-xl font-semibold mb-2">installation</h2>
			<pre className="p-4 rounded bg-neutral-900 border border-neutral-800 mb-8">
				<code>bun add fromsrc</code>
			</pre>
			<h2 className="text-xl font-semibold mb-2">next steps</h2>
			<ul className="list-disc list-inside text-neutral-400">
				<li>add mdx files to docs/</li>
				<li>customize the sidebar</li>
				<li>deploy to vercel</li>
			</ul>
		</main>
	)
}
