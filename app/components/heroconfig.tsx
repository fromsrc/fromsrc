import type { file } from "./herotype";

const k = "text-white/40";
const v = "text-white/70";
const p = "text-white/50";
const d = "text-white/25";

export const heroconfig: file = {
  lines: [
    {
      content: (
        <>
          <span className={p}>import</span>{" "}
          <span className={v}>{"{ defineConfig }"}</span>{" "}
          <span className={p}>from</span>{" "}
          <span className={k}>"fromsrc"</span>
        </>
      ),
      num: 1,
    },
    { content: <>&nbsp;</>, num: 2 },
    {
      content: (
        <>
          <span className={p}>export default</span>{" "}
          <span className={v}>defineConfig</span>
          <span className={d}>({"{"}</span>
        </>
      ),
      num: 3,
    },
    {
      content: (
        <>
          {"  "}<span className={k}>title:</span>{" "}
          <span className={p}>"My Docs"</span>,
        </>
      ),
      num: 4,
    },
    {
      content: (
        <>
          {"  "}<span className={k}>description:</span>{" "}
          <span className={p}>"API documentation"</span>,
        </>
      ),
      num: 5,
    },
    {
      content: (
        <>
          {"  "}<span className={k}>llmsTxt:</span>{" "}
          <span className={v}>true</span>,
        </>
      ),
      num: 6,
    },
    {
      content: (
        <>
          {"  "}<span className={k}>mcp:</span>{" "}
          <span className={v}>true</span>,
        </>
      ),
      num: 7,
    },
    {
      content: (
        <>
          {"  "}<span className={k}>search:</span>{" "}
          <span className={d}>{"{"}</span>{" "}
          <span className={k}>provider:</span>{" "}
          <span className={p}>"orama"</span>{" "}
          <span className={d}>{"}"}</span>,
        </>
      ),
      num: 8,
    },
    {
      content: (
        <>
          {"  "}<span className={k}>theme:</span>{" "}
          <span className={d}>{"{"}</span>{" "}
          <span className={k}>accent:</span>{" "}
          <span className={p}>"#ef4444"</span>{" "}
          <span className={d}>{"}"}</span>,
        </>
      ),
      num: 9,
    },
    {
      content: (
        <>
          {"  "}<span className={k}>sidebar:</span>{" "}
          <span className={d}>{"{"}</span>{" "}
          <span className={k}>collapsed:</span>{" "}
          <span className={v}>false</span>{" "}
          <span className={d}>{"}"}</span>,
        </>
      ),
      num: 10,
    },
    {
      content: (
        <>
          <span className={d}>{"}"})</span>
        </>
      ),
      num: 11,
    },
  ],
  name: "fromsrc.config.ts",
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
};
