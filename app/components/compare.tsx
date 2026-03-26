import Link from "next/link";

export function Compare() {
  return (
    <section id="why" className="mx-6 min-[1024px]:mx-10">
      <div className="bg-[#201c18] text-[#f2ece4] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(242,236,228,0.5) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
          aria-hidden="true"
        />

        <div className="relative flex flex-col min-[1024px]:flex-row">
          <div className="p-10 min-[1024px]:p-16 min-[1024px]:w-[55%]">
            <h2 className="font-serif text-[2.5rem] min-[1024px]:text-[3.2rem] leading-[1.15] tracking-tight mb-8">
              Built for scale,
              <br />
              designed for devs.
            </h2>

            <p className="text-[#f2ece4]/50 text-sm leading-relaxed max-w-md mb-12" style={{ fontFamily: "var(--font-serif)" }}>
              Incremental builds that don't crash at 3,000 pages.
              Direct component imports in MDX. AI endpoints on every page.
              Everything you need, nothing you don't.
            </p>

            <Link
              href="/docs"
              className="inline-block border border-[#f2ece4]/40 px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] text-[#f2ece4]/80 hover:bg-[#f2ece4]/10 hover:border-[#f2ece4]/60 transition-all duration-200"
            >
              explore the docs
            </Link>
          </div>

          <div className="min-[1024px]:flex-1 relative min-h-[300px]">
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(242,236,228,0.4) 1.5px, transparent 1.5px)",
                backgroundSize: "12px 12px",
              }}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="border-t border-[#f2ece4]/10 px-10 min-[1024px]:px-16 py-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#f2ece4]/30 text-center">
            next.js · vite · astro · react router · tanstack · remix · any react framework
          </p>
        </div>
      </div>
    </section>
  );
}
