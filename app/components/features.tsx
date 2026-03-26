import type { ReactNode } from "react";

interface row {
  readonly tone: "cmd" | "code" | "dim";
  readonly text: string;
}

const mdxrows: readonly row[] = [
  { tone: "cmd", text: "---" },
  { tone: "code", text: "title: Authentication" },
  { tone: "cmd", text: "---" },
  { tone: "dim", text: "" },
  { tone: "code", text: "import { Endpoint } from 'fromsrc/client'" },
  { tone: "dim", text: "" },
  { tone: "code", text: "# OAuth 2.0" },
  { tone: "dim", text: "" },
  { tone: "code", text: "Configure providers for single sign-on." },
  { tone: "dim", text: "" },
  { tone: "code", text: '<Endpoint method="POST" path="/auth/token" />' },
];

const airows: readonly row[] = [
  { tone: "cmd", text: "$ curl https://docs.example.com/api/llms/auth" },
  { tone: "dim", text: "" },
  { tone: "code", text: "# Authentication" },
  { tone: "code", text: "Secure your API with bearer tokens and OAuth 2.0." },
  { tone: "dim", text: "" },
  { tone: "code", text: "# Endpoints" },
  { tone: "code", text: "POST /auth/token — generate access token" },
  { tone: "code", text: "POST /auth/refresh — refresh expired token" },
  { tone: "code", text: "DELETE /auth/revoke — revoke active session" },
  { tone: "dim", text: "" },
  { tone: "dim", text: "200 ok · text/plain · 248ms" },
];

const searchrows: readonly row[] = [
  { tone: "cmd", text: "$ bunx create-fromsrc" },
  { tone: "dim", text: "" },
  { tone: "code", text: "  title: my-docs" },
  { tone: "code", text: "  framework: next.js" },
  { tone: "code", text: "  search: orama" },
  { tone: "code", text: "  theme: dark" },
  { tone: "dim", text: "" },
  { tone: "code", text: "  installing dependencies..." },
  { tone: "code", text: "  created 12 files" },
  { tone: "dim", text: "" },
  { tone: "code", text: "  ready. run bun dev to start." },
];

function rowstyle(tone: row["tone"]): string {
  switch (tone) {
    case "cmd": return "text-white/75";
    case "dim": return "text-white/35";
    default: return "text-white/60";
  }
}

function Panel({ rows }: { readonly rows: readonly row[] }) {
  return (
    <div className="flex h-[280px] flex-col bg-[#050505]">
      <div className="flex-1 px-5 py-4 font-mono text-[13px] leading-[1.65] tabular-nums whitespace-pre">
        {rows.map((entry, index) => (
          <div key={`${entry.text}-${index}`} className={rowstyle(entry.tone)}>
            {entry.text || "\u00A0"}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stage({
  tone,
  children,
}: {
  readonly tone: "slate" | "ash" | "iron";
  readonly children: ReactNode;
}) {
  const tones = {
    slate: { bg: "#b8b8b8", img: "radial-gradient(900px 420px at 26% 18%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 62%), radial-gradient(720px 520px at 82% 72%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 58%), linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 55%)" },
    ash: { bg: "#a8a8a8", img: "radial-gradient(900px 420px at 22% 20%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 62%), radial-gradient(820px 560px at 80% 74%, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0) 60%), linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 55%)" },
    iron: { bg: "#b0b0b0", img: "radial-gradient(900px 420px at 24% 18%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 62%), radial-gradient(780px 560px at 82% 72%, rgba(0,0,0,0.17) 0%, rgba(0,0,0,0) 60%), linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 55%)" },
  };
  const s = tones[tone];
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/[0.06] p-4 sm:p-6 md:p-10"
      style={{
        backgroundColor: s.bg,
        backgroundImage: s.img,
        boxShadow: "0 50px 90px rgba(0,0,0,0.55), 0 2px 0 rgba(255,255,255,0.06) inset, 0 -1px 0 rgba(0,0,0,0.24) inset",
      }}
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative">{children}</div>
    </div>
  );
}

function Window({ children }: { readonly children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0A0A0A] shadow-[0_40px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/5">
      {children}
    </div>
  );
}

function Spotlight({
  tone,
  title,
  description,
  bullets,
  flip,
  window,
}: {
  readonly tone: "slate" | "ash" | "iron";
  readonly title: string;
  readonly description: string;
  readonly bullets: readonly string[];
  readonly flip?: boolean;
  readonly window: ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <div className={flip ? "order-2 md:order-2" : "order-2 md:order-1"}>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mt-4 text-sm text-[#888] leading-relaxed">
          {description}
        </p>
        <ul className="mt-8 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-3 text-sm text-white/70">
              <span className="h-1 w-1 rounded-full bg-white/40" />
              {b}
            </li>
          ))}
        </ul>
      </div>

      <div className={flip ? "order-1 md:order-1" : "order-1 md:order-2"}>
        <Stage tone={tone}>
          <div className="mx-auto w-full max-w-[1160px]">
            <Window>
              {window}
            </Window>
          </div>
        </Stage>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section>
      <div className="mx-auto max-w-[1320px] px-6 pt-20 pb-20 md:pt-28 md:pb-28">
        <div className="space-y-16 md:space-y-28">
          <Spotlight
            tone="slate"
            title="Just MDX and components."
            description="Import any React component directly into your markdown. No content layer abstraction. No vendor lock-in. Write docs the way you write code."
            bullets={[
              "direct component imports in MDX",
              "incremental builds at 3,000+ pages",
              "120+ built-in components",
            ]}
            window={<Panel rows={mdxrows} />}
          />

          <Spotlight
            tone="ash"
            title="Your docs speak AI."
            description="Every page exposes content endpoints. Feed docs to LLMs, build RAG pipelines, or connect via Model Context Protocol. AI-native out of the box."
            bullets={[
              "llms.txt and per-page API endpoints",
              "built-in MCP server",
              "raw markdown and AI-optimized formats",
            ]}
            flip
            window={<Panel rows={airows} />}
          />

          <Spotlight
            tone="iron"
            title="Zero to docs in seconds."
            description="One command to scaffold a complete docs site. Works with Next.js, Vite, Astro, React Router, TanStack, and Remix. Pick your framework, start writing."
            bullets={[
              "scaffold with bunx create-fromsrc",
              "6 framework adapters included",
              "search, sidebar, and syntax highlighting built in",
            ]}
            window={<Panel rows={searchrows} />}
          />
        </div>
      </div>
    </section>
  );
}
