import type { file } from "./herotype";

const k = "text-white/40";
const v = "text-white/70";
const p = "text-white/50";
const d = "text-white/25";

export const heroauth: file = {
  lines: [
    {
      content: (
        <>
          <span className={d}>---</span>
        </>
      ),
      num: 1,
    },
    {
      content: (
        <>
          <span className={k}>title:</span>{" "}
          <span className={v}>Authentication</span>
        </>
      ),
      num: 2,
    },
    {
      content: (
        <>
          <span className={d}>---</span>
        </>
      ),
      num: 3,
    },
    { content: <>&nbsp;</>, num: 4 },
    {
      content: (
        <>
          <span className={p}>import</span>{" "}
          <span className={v}>{"{ ApiEndpoint }"}</span>{" "}
          <span className={p}>from</span>{" "}
          <span className={k}>"@/components"</span>
        </>
      ),
      num: 5,
    },
    { content: <>&nbsp;</>, num: 6 },
    {
      content: (
        <>
          <span className={k}># OAuth 2.0</span>
        </>
      ),
      num: 7,
    },
    { content: <>&nbsp;</>, num: 8 },
    {
      content: (
        <>
          <span className={v}>Configure OAuth providers for SSO.</span>
        </>
      ),
      num: 9,
    },
    { content: <>&nbsp;</>, num: 10 },
    {
      content: (
        <>
          <span className={d}>{"<"}</span>
          <span className={v}>ApiEndpoint</span>{" "}
          <span className={k}>method=</span>
          <span className={p}>"POST"</span> <span className={k}>path=</span>
          <span className={p}>"/auth/token"</span>{" "}
          <span className={d}>/{">"}</span>
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
