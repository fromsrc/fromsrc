"use client"

import { useEffect, useId, useState } from "react"

export interface MermaidProps {
	chart: string
}

export function Mermaid({ chart }: MermaidProps) {
	const id = useId()
	const [svg, setSvg] = useState<string>("")
	const [error, setError] = useState<string>("")

	useEffect(() => {
		let mounted = true

		async function render() {
			try {
				const mermaid = (await import(/* webpackIgnore: true */ "mermaid" as any)).default as any
				mermaid.initialize({
					startOnLoad: false,
					securityLevel: "loose",
					fontFamily: "inherit",
					theme: "dark",
				})

				const { svg: rendered } = await mermaid.render(
					id.replace(/:/g, ""),
					chart.replaceAll("\\n", "\n"),
				)

				if (mounted) {
					setSvg(rendered)
					setError("")
				}
			} catch (e) {
				if (mounted) {
					setError(e instanceof Error ? e.message : "failed to render")
				}
			}
		}

		render()
		return () => {
			mounted = false
		}
	}, [chart, id])

	if (error) {
		return (
			<div className="my-4 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
				{error}
			</div>
		)
	}

	if (!svg) {
		return (
			<div className="my-4 p-8 rounded-lg border border-line bg-surface/30 animate-pulse">
				<div className="h-32 bg-surface/50 rounded" />
			</div>
		)
	}

	return (
		<div
			className="my-4 overflow-x-auto [&_svg]:mx-auto"
			dangerouslySetInnerHTML={{ __html: svg }}
		/>
	)
}
