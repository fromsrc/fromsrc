const components = [
  "sidebar",
  "toc",
  "codeblock",
  "tabs",
  "callout",
  "steps",
  "search",
  "accordion",
  "cards",
  "openapi",
  "math",
  "mermaid",
];

const frameworks = [
  "next.js",
  "vite",
  "astro",
  "react router",
  "tanstack",
  "remix",
];

export function Parts() {
  return (
    <section className="border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1320px] px-6 py-20 md:py-28">
        <div className="grid items-end gap-8 md:grid-cols-[1fr_1fr] mb-14">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            120+ components.
          </h2>
          <p className="text-sm text-[#888] leading-relaxed max-w-sm md:ml-auto">
            Import what you need. Replace what you don't. No swizzling.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-16">
          {components.map((c) => (
            <div
              key={c}
              className="rounded-lg border border-white/[0.08] px-4 py-2 text-[11px] font-mono text-white/40 hover:text-white/80 hover:border-white/20 transition-all duration-200 cursor-default"
            >
              {c}
            </div>
          ))}
          <div className="rounded-lg border border-white/[0.06] px-4 py-2 text-[11px] font-mono text-white/20">
            +108 more
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-8">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {frameworks.map((f) => (
              <span
                key={f}
                className="text-[11px] font-mono text-white/20 uppercase tracking-wider"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
