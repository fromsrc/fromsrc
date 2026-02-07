import { useEffect, useState } from "react"

export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl"

export type BreakpointConfig = Record<Breakpoint, number>

const defaults: BreakpointConfig = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 }

const ordered: Breakpoint[] = ["2xl", "xl", "lg", "md", "sm"]

function resolve(config: BreakpointConfig): Breakpoint {
	for (const bp of ordered) {
		if (window.matchMedia(`(min-width: ${config[bp]}px)`).matches) return bp
	}
	return "sm"
}

export function useBreakpoint(config?: Partial<BreakpointConfig>): Breakpoint {
	const merged = { ...defaults, ...config }
	const [breakpoint, setBreakpoint] = useState<Breakpoint>(() =>
		typeof window === "undefined" ? "lg" : resolve(merged),
	)

	useEffect(() => {
		const queries = ordered.map((bp) => {
			const mql = window.matchMedia(`(min-width: ${merged[bp]}px)`)
			const handler = () => setBreakpoint(resolve(merged))
			mql.addEventListener("change", handler)
			return () => mql.removeEventListener("change", handler)
		})
		setBreakpoint(resolve(merged))
		return () => queries.forEach((cleanup) => cleanup())
	}, [merged.sm, merged.md, merged.lg, merged.xl, merged["2xl"]])

	return breakpoint
}

export function useAboveBreakpoint(
	breakpoint: Breakpoint,
	config?: Partial<BreakpointConfig>,
): boolean {
	const merged = { ...defaults, ...config }
	const current = useBreakpoint(config)
	return merged[current] >= merged[breakpoint]
}
