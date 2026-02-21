export type ThemeColors = {
	bg: string; surface: string; fg: string; muted: string; dim: string
	accent: string; line: string; success: string; warning: string; error: string; info: string
}

export type ThemeConfig = {
	light: ThemeColors; dark: ThemeColors; radius?: string; font?: string; mono?: string
}

export type ThemePreset = { name: string; config: ThemeConfig }

const colorKeys: (keyof ThemeColors)[] = [
	"bg", "surface", "fg", "muted", "dim", "accent", "line", "success", "warning", "error", "info",
]

function colors(
	bg: string, surface: string, fg: string, muted: string, dim: string,
	accent: string, line: string, success: string, warning: string, error: string, info: string,
): ThemeColors {
	return { bg, surface, fg, muted, dim, accent, line, success, warning, error, info }
}

export function generateCss(config: ThemeConfig): string {
	const lines: string[] = [":root {"]
	for (const key of colorKeys) lines.push(`\t--${key}: ${config.light[key]};`)
	if (config.radius) lines.push(`\t--radius: ${config.radius};`)
	if (config.font) lines.push(`\t--font: ${config.font};`)
	if (config.mono) lines.push(`\t--mono: ${config.mono};`)
	lines.push("}", "", ".dark {")
	for (const key of colorKeys) lines.push(`\t--${key}: ${config.dark[key]};`)
	lines.push("}")
	return lines.join("\n")
}

export const presets: Record<string, ThemePreset> = {
	default: {
		name: "default",
		config: {
			light: colors("#ffffff", "#f8f9fa", "#1a1a1a", "#6b7280", "#9ca3af", "#2563eb", "#e5e7eb", "#16a34a", "#ca8a04", "#dc2626", "#2563eb"),
			dark: colors("#0a0a0a", "#141414", "#f5f5f5", "#a1a1aa", "#71717a", "#3b82f6", "#27272a", "#22c55e", "#eab308", "#ef4444", "#3b82f6"),
		},
	},
	ocean: {
		name: "ocean",
		config: {
			light: colors("#f0f7ff", "#e0efff", "#0c1929", "#4a6a8a", "#7a9aba", "#0066cc", "#c4daf0", "#0d7a3e", "#b8860b", "#c41e3a", "#0066cc"),
			dark: colors("#0a1628", "#112240", "#e6f0ff", "#8baac8", "#5a7a98", "#4d9fff", "#1e3a5f", "#2ecc71", "#f1c40f", "#e74c3c", "#4d9fff"),
		},
	},
	forest: {
		name: "forest",
		config: {
			light: colors("#f5faf5", "#e8f5e8", "#1a2e1a", "#4a6b4a", "#7a9b7a", "#2d8a4e", "#c8e0c8", "#1a7a35", "#a68b00", "#c0392b", "#2d8a4e"),
			dark: colors("#0a160a", "#142014", "#e8f5e8", "#8ab88a", "#5a8a5a", "#4caf50", "#1e3a1e", "#27ae60", "#f39c12", "#e74c3c", "#4caf50"),
		},
	},
	rose: {
		name: "rose",
		config: {
			light: colors("#fff5f7", "#ffe4ea", "#2a1015", "#8a4a5a", "#ba7a8a", "#e11d48", "#f0c8d0", "#16a34a", "#ca8a04", "#dc2626", "#e11d48"),
			dark: colors("#160a0e", "#201418", "#fce4ec", "#c88a9a", "#8a5a6a", "#fb7185", "#3a1e28", "#22c55e", "#eab308", "#ef4444", "#fb7185"),
		},
	},
}

export function mergeTheme(base: ThemeConfig, overrides: Partial<ThemeConfig>): ThemeConfig {
	return {
		light: { ...base.light, ...overrides.light },
		dark: { ...base.dark, ...overrides.dark },
		radius: overrides.radius ?? base.radius,
		font: overrides.font ?? base.font,
		mono: overrides.mono ?? base.mono,
	}
}

function luminance(hex: string): number {
	const rgb = [1, 3, 5].map((i) => {
		const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
	})
	const red = rgb[0] ?? 0
	const green = rgb[1] ?? 0
	const blue = rgb[2] ?? 0
	return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

export function contrastRatio(hex1: string, hex2: string): number {
	const l1 = luminance(hex1)
	const l2 = luminance(hex2)
	const lighter = Math.max(l1, l2)
	const darker = Math.min(l1, l2)
	return (lighter + 0.05) / (darker + 0.05)
}

export function cssVariables(colors: ThemeColors): Record<string, string> {
	const vars: Record<string, string> = {}
	for (const key of colorKeys) {
		vars[`--${key}`] = colors[key]
	}
	return vars
}
