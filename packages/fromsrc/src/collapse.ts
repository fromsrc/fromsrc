import type { ShikiTransformer } from "@shikijs/types"

export function transformerCollapse(): ShikiTransformer {
	return {
		name: "collapse",
		line(node, line) {
			let found = false
			let isStart = false
			let isEnd = false

			for (const child of node.children) {
				if (child.type === "element" && child.tagName === "span") {
					for (const grandchild of child.children) {
						if (grandchild.type === "text") {
							if (/\[!code collapse:start\]/.test(grandchild.value)) {
								grandchild.value = grandchild.value.replace(/\/\/ \[!code collapse:start\]|# \[!code collapse:start\]/, "")
								isStart = true
								found = true
							}
							if (/\[!code collapse:end\]/.test(grandchild.value)) {
								grandchild.value = grandchild.value.replace(/\/\/ \[!code collapse:end\]|# \[!code collapse:end\]/, "")
								isEnd = true
								found = true
							}
						}
					}
				}
			}

			if (found) {
				if (isStart) this.addClassToHast(node, "collapse-start")
				if (isEnd) this.addClassToHast(node, "collapse-end")
			}
		},
		pre(node) {
			const codeEl = node.children[0]
			if (!codeEl || codeEl.type !== "element") return

			const lines = "children" in codeEl ? codeEl.children : []
			if (!lines || !Array.isArray(lines)) return

			let inCollapse = false
			let collapseStart = -1
			let collapseLines: typeof lines = []

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i]
				if (!line || line.type !== "element") continue
				if (!line.properties) continue

				const classes = Array.isArray(line.properties.class) ? line.properties.class : []
				const hasCollapseStart = classes.includes("collapse-start")
				const hasCollapseEnd = classes.includes("collapse-end")

				if (hasCollapseStart && !inCollapse) {
					inCollapse = true
					collapseStart = i
					collapseLines = []

					const filteredClasses = classes.filter((c) => c !== "collapse-start")
					if (filteredClasses.length > 0) {
						line.properties.class = filteredClasses
					} else {
						delete line.properties.class
					}
					collapseLines.push(line)
					continue
				}

				if (hasCollapseEnd && inCollapse) {
					inCollapse = false

					const filteredClasses = classes.filter((c) => c !== "collapse-end")
					if (filteredClasses.length > 0) {
						line.properties.class = filteredClasses
					} else {
						delete line.properties.class
					}
					collapseLines.push(line)

					const count = collapseLines.length

					const details = {
						type: "element" as const,
						tagName: "details",
						properties: { class: ["code-collapse"] },
						children: [
							{
								type: "element" as const,
								tagName: "summary",
								properties: {},
								children: [
									{
										type: "text" as const,
										value: `${count} collapsed ${count === 1 ? "line" : "lines"}`,
									},
								],
							},
							...collapseLines,
						],
					}

					lines.splice(collapseStart, count, details)
					i = collapseStart
					collapseLines = []
					continue
				}

				if (inCollapse) {
					collapseLines.push(line)
				}
			}
		},
	}
}
