"use client"

import type { ReactElement } from "react"
import { useEffect, useId, useState } from "react"

export interface MermaidProps {
	chart: string
	label?: string
}

interface MermaidConfig {
	startOnLoad: boolean
	securityLevel: "strict" | "loose" | "antiscript" | "sandbox"
	fontFamily: string
	theme: "default" | "forest" | "dark" | "neutral" | "base"
}

interface MermaidAPI {
	initialize: (config: MermaidConfig) => void
	render: (id: string, code: string) => Promise<{ svg: string }>
}

export function Mermaid({ chart, label }: MermaidProps): ReactElement {
	const id = useId()
	const [svg, setSvg] = useState<string>("")
	const [error, setError] = useState<boolean>(false)

	useEffect(() => {
		if (!chart.trim()) {
			setError(true)
			return
		}

		let mounted = true

		async function render() {
			try {
				const module = await import("mermaid" as string)
				const mermaid = module.default as MermaidAPI
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
					setError(false)
				}
			} catch {
				if (mounted) {
					setError(true)
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
			<div
				role="alert"
				className="my-4 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm"
			>
				error
			</div>
		)
	}

	if (!svg) {
		return (
			<div aria-hidden className="my-4 p-8 rounded-lg border border-line bg-surface/30 animate-pulse">
				<div className="h-32 bg-surface/50 rounded" />
			</div>
		)
	}

	return (
		<div
			role="img"
			aria-label={label || "diagram"}
			className="my-4 overflow-x-auto [&_svg]:mx-auto"
			dangerouslySetInnerHTML={{ __html: svg }}
		/>
	)
}
