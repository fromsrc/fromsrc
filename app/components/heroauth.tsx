import type { file } from "./herotype"

export const heroauth: file = {
	name: "docs/auth.mdx",
	lines: [
		{ num: 1, content: <><span className="text-dim">---</span></> },
		{
			num: 2,
			content: <><span className="text-muted">title:</span>{" "}<span className="text-fg">Authentication</span></>,
		},
		{ num: 3, content: <><span className="text-dim">---</span></> },
		{ num: 4, content: <>&nbsp;</> },
		{
			num: 5,
			content: <><span className="text-accent">import</span>{" "}<span className="text-fg">{"{ ApiEndpoint }"}</span>{" "}<span className="text-accent">from</span>{" "}<span className="text-muted">"@/components"</span></>,
		},
		{ num: 6, content: <>&nbsp;</> },
		{ num: 7, content: <><span className="text-muted"># OAuth 2.0</span></> },
		{ num: 8, content: <>&nbsp;</> },
		{ num: 9, content: <>Configure OAuth providers for SSO.</> },
		{ num: 10, content: <>&nbsp;</> },
		{
			num: 11,
			content: <><span className="text-dim">{"<"}</span><span className="text-fg">ApiEndpoint</span> <span className="text-muted">method=</span><span className="text-accent">"POST"</span> <span className="text-muted">path=</span><span className="text-accent">"/auth/token"</span>{" "}<span className="text-dim">/{">"}</span></>,
		},
	],
	raw: `---
title: Authentication
---

import { ApiEndpoint } from "@/components"

# OAuth 2.0

Configure OAuth providers for SSO.

<ApiEndpoint method="POST" path="/auth/token" />`,
}
