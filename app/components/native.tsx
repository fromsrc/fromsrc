const endpoints = [
  { method: "GET", path: "/api/raw/auth", label: "raw markdown" },
  { method: "GET", path: "/api/llms/auth", label: "ai-optimized" },
  { method: "GET", path: "/llms.txt", label: "full index" },
  { method: "POST", path: "/api/mcp", label: "mcp server" },
];

export function Native() {
  return (
    <section id="ai" className="border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1320px] px-6 py-20 md:py-28">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Your docs speak AI.
            </h2>

            <p className="mt-5 text-sm text-[#888] leading-relaxed max-w-md">
              Every page exposes content endpoints out of the box.
              Feed docs to LLMs, build RAG pipelines, or connect
              via Model Context Protocol.
            </p>

            <div className="mt-10 space-y-0">
              {endpoints.map((e) => (
                <div
                  key={e.path}
                  className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/25 w-8">
                      {e.method}
                    </span>
                    <code className="text-white/60 text-xs">{e.path}</code>
                  </div>
                  <span className="text-white/20 text-[10px] font-mono uppercase tracking-wider hidden sm:block">
                    {e.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10 bg-[#050505] shadow-[0_40px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/5">
            <div className="border-b border-white/[0.06] bg-black/15 px-4 py-2">
              <span className="text-[11px] font-mono text-white/35">terminal</span>
            </div>
            <div className="p-5 font-mono text-[13px] leading-[1.8] whitespace-pre">
              <div className="flex gap-3">
                <span className="text-white/30 select-none" aria-hidden="true">$</span>
                <span className="text-white/70">curl https://your-docs.com/api/llms/auth</span>
              </div>
              <div className="mt-4 pl-4 border-l border-white/[0.08] text-white/40 space-y-0.5">
                <p className="text-white/20"># Authentication</p>
                <p>Secure your API with bearer tokens and OAuth 2.0.</p>
                <p className="mt-3 text-white/20"># Endpoints</p>
                <p>POST /auth/token — generate access token</p>
                <p>POST /auth/refresh — refresh expired token</p>
                <p>DELETE /auth/revoke — revoke active session</p>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.06] text-[10px] text-white/20 uppercase tracking-wider">
                <span>200 ok</span>
                <span>text/plain</span>
                <span>248ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
