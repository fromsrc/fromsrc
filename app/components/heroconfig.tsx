import type { file } from "./herotype"

export const heroconfig: file = {
	name: "fromsrc.config.ts",
	lines: [
		{
			num: 1,
			content: <><span className="text-accent">import</span>{" "}<span className="text-fg">{"{ defineConfig }"}</span>{" "}<span className="text-accent">from</span> <span className="text-muted">"fromsrc"</span></>,
		},
		{ num: 2, content: <>&nbsp;</> },
		{
			num: 3,
			content: <><span className="text-accent">export default</span>{" "}<span className="text-fg">defineConfig</span><span className="text-dim">({"{"}</span></>,
		},
		{
			num: 4,
			content: <>&nbsp;&nbsp;<span className="text-muted">title:</span>{" "}<span className="text-accent">"My Docs"</span>,</>,
		},
		{
			num: 5,
			content: <>&nbsp;&nbsp;<span className="text-muted">description:</span>{" "}<span className="text-accent">"API documentation"</span>,</>,
		},
		{
			num: 6,
			content: <>&nbsp;&nbsp;<span className="text-muted">llmsTxt:</span>{" "}<span className="text-fg">true</span>,</>,
		},
		{
			num: 7,
			content: <>&nbsp;&nbsp;<span className="text-muted">mcp:</span>{" "}<span className="text-fg">true</span>,</>,
		},
		{
			num: 8,
			content: <>&nbsp;&nbsp;<span className="text-muted">search:</span>{" "}<span className="text-dim">{"{"}</span> <span className="text-muted">provider:</span>{" "}<span className="text-accent">"orama"</span> <span className="text-dim">{"}"}</span>,</>,
		},
		{
			num: 9,
			content: <>&nbsp;&nbsp;<span className="text-muted">theme:</span>{" "}<span className="text-dim">{"{"}</span> <span className="text-muted">accent:</span>{" "}<span className="text-accent">"#ef4444"</span> <span className="text-dim">{"}"}</span>,</>,
		},
		{
			num: 10,
			content: <>&nbsp;&nbsp;<span className="text-muted">sidebar:</span>{" "}<span className="text-dim">{"{"}</span> <span className="text-muted">collapsed:</span>{" "}<span className="text-fg">false</span> <span className="text-dim">{"}"}</span>,</>,
		},
		{ num: 11, content: <><span className="text-dim">{"}"})</span></> },
	],
	raw: `import { defineConfig } from "fromsrc"

export default defineConfig({
  title: "My Docs",
  description: "API documentation",
  llmsTxt: true,
  mcp: true,
  search: { provider: "orama" },
  theme: { accent: "#ef4444" },
  sidebar: { collapsed: false },
})`,
}
