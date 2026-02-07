import type { ShikiTransformer } from "@shikijs/types"

const ansiColors: Record<number, string> = {
	30: "#000000",
	31: "#f85149",
	32: "#3fb950",
	33: "#d29922",
	34: "#58a6ff",
	35: "#bc8cff",
	36: "#39c5cf",
	37: "#e6edf3",
	40: "#000000",
	41: "#f85149",
	42: "#3fb950",
	43: "#d29922",
	44: "#58a6ff",
	45: "#bc8cff",
	46: "#39c5cf",
	47: "#e6edf3",
	90: "#484f58",
	91: "#ff7b72",
	92: "#56d364",
	93: "#e3b341",
	94: "#79c0ff",
	95: "#d2a8ff",
	96: "#56d4dd",
	97: "#f0f6fc",
	100: "#484f58",
	101: "#ff7b72",
	102: "#56d364",
	103: "#e3b341",
	104: "#79c0ff",
	105: "#d2a8ff",
	106: "#56d4dd",
	107: "#f0f6fc",
}

interface AnsiState {
	bold: boolean
	dim: boolean
	italic: boolean
	underline: boolean
	fg: string | null
	bg: string | null
}

function parseAnsi(text: string) {
	const segments: Array<{ text: string; style: AnsiState }> = []
	const state: AnsiState = {
		bold: false,
		dim: false,
		italic: false,
		underline: false,
		fg: null,
		bg: null,
	}

	let current = ""
	let i = 0

	while (i < text.length) {
		if (text[i] === "\x1b" && text[i + 1] === "[") {
			if (current) {
				segments.push({ text: current, style: { ...state } })
				current = ""
			}

			let j = i + 2
			while (j < text.length && text[j] !== "m") {
				j++
			}

			const codes = text.slice(i + 2, j).split(";").map(Number)
			i = j + 1

			let k = 0
			while (k < codes.length) {
				const code = codes[k]
				if (code === undefined) {
					k++
					continue
				}

				if (code === 0) {
					state.bold = false
					state.dim = false
					state.italic = false
					state.underline = false
					state.fg = null
					state.bg = null
				} else if (code === 1) {
					state.bold = true
				} else if (code === 2) {
					state.dim = true
				} else if (code === 3) {
					state.italic = true
				} else if (code === 4) {
					state.underline = true
				} else if (code === 22) {
					state.bold = false
					state.dim = false
				} else if (code === 23) {
					state.italic = false
				} else if (code === 24) {
					state.underline = false
				} else if (code === 38 && codes[k + 1] === 5) {
					const colorIndex = codes[k + 2]
					if (colorIndex !== undefined) {
						state.fg = ansi256ToHex(colorIndex)
						k += 2
					}
				} else if (code === 48 && codes[k + 1] === 5) {
					const colorIndex = codes[k + 2]
					if (colorIndex !== undefined) {
						state.bg = ansi256ToHex(colorIndex)
						k += 2
					}
				} else if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97)) {
					state.fg = ansiColors[code] || null
				} else if ((code >= 40 && code <= 47) || (code >= 100 && code <= 107)) {
					state.bg = ansiColors[code] || null
				} else if (code === 39) {
					state.fg = null
				} else if (code === 49) {
					state.bg = null
				}

				k++
			}
		} else {
			current += text[i]
			i++
		}
	}

	if (current) {
		segments.push({ text: current, style: { ...state } })
	}

	return segments
}

function ansi256ToHex(n: number): string {
	if (n < 16) {
		const basic = [0, 128, 0, 128, 0, 128, 0, 192, 128, 255, 0, 255, 0, 255, 0, 255]
		const r = basic[n * 3] || 0
		const g = basic[n * 3 + 1] || 0
		const b = basic[n * 3 + 2] || 0
		return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
	}

	if (n < 232) {
		const index = n - 16
		const r = Math.floor(index / 36)
		const g = Math.floor((index % 36) / 6)
		const b = index % 6
		const toVal = (v: number) => (v === 0 ? 0 : 55 + v * 40)
		return `#${toVal(r).toString(16).padStart(2, "0")}${toVal(g).toString(16).padStart(2, "0")}${toVal(b).toString(16).padStart(2, "0")}`
	}

	const gray = 8 + (n - 232) * 10
	return `#${gray.toString(16).padStart(2, "0")}${gray.toString(16).padStart(2, "0")}${gray.toString(16).padStart(2, "0")}`
}

export function transformerAnsi(): ShikiTransformer {
	return {
		name: "ansi",
		preprocess(code, options) {
			if (options.lang === "ansi" || options.lang === "terminal") {
				return code
			}
		},
		code(node) {
			const lang = this.options.lang
			if (lang !== "ansi" && lang !== "terminal") return

			const lines = node.children
			if (!Array.isArray(lines)) return

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i]
				if (!line || line.type !== "element") continue

				const textNode = line.children[0]
				if (!textNode || textNode.type !== "text") continue

				const text = textNode.value
				const segments = parseAnsi(text)

				if (segments.length === 0) continue

				line.children = segments.map((seg) => {
					const styles: string[] = []

					if (seg.style.fg) styles.push(`color: ${seg.style.fg}`)
					if (seg.style.bg) styles.push(`background-color: ${seg.style.bg}`)
					if (seg.style.bold) styles.push("font-weight: bold")
					if (seg.style.dim) styles.push("opacity: 0.5")
					if (seg.style.italic) styles.push("font-style: italic")
					if (seg.style.underline) styles.push("text-decoration: underline")

					if (styles.length === 0) {
						return {
							type: "text" as const,
							value: seg.text,
						}
					}

					return {
						type: "element" as const,
						tagName: "span",
						properties: { style: styles.join("; ") },
						children: [
							{
								type: "text" as const,
								value: seg.text,
							},
						],
					}
				})
			}
		},
	}
}
