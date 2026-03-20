import type { file } from "./herotype";

export const heroauth: file = {
  lines: [
    {
      content: (
        <>
          <span className="text-dim">---</span>
        </>
      ),
      num: 1,
    },
    {
      content: (
        <>
          <span className="text-muted">title:</span>{" "}
          <span className="text-fg">Authentication</span>
        </>
      ),
      num: 2,
    },
    {
      content: (
        <>
          <span className="text-dim">---</span>
        </>
      ),
      num: 3,
    },
    { content: <>&nbsp;</>, num: 4 },
    {
      content: (
        <>
          <span className="text-accent">import</span>{" "}
          <span className="text-fg">{"{ ApiEndpoint }"}</span>{" "}
          <span className="text-accent">from</span>{" "}
          <span className="text-muted">"@/components"</span>
        </>
      ),
      num: 5,
    },
    { content: <>&nbsp;</>, num: 6 },
    {
      content: (
        <>
          <span className="text-muted"># OAuth 2.0</span>
        </>
      ),
      num: 7,
    },
    { content: <>&nbsp;</>, num: 8 },
    { content: <>Configure OAuth providers for SSO.</>, num: 9 },
    { content: <>&nbsp;</>, num: 10 },
    {
      content: (
        <>
          <span className="text-dim">{"<"}</span>
          <span className="text-fg">ApiEndpoint</span>{" "}
          <span className="text-muted">method=</span>
          <span className="text-accent">"POST"</span>{" "}
          <span className="text-muted">path=</span>
          <span className="text-accent">"/auth/token"</span>{" "}
          <span className="text-dim">/{">"}</span>
        </>
      ),
      num: 11,
    },
  ],
  name: "docs/auth.mdx",
  raw: `---
title: Authentication
---

import { ApiEndpoint } from "@/components"

# OAuth 2.0

Configure OAuth providers for SSO.

<ApiEndpoint method="POST" path="/auth/token" />`,
};
