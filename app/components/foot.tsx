import Link from "next/link";

import { Logo } from "./logo";

export function Foot() {
  return (
    <footer>
      <div className="mx-auto max-w-[1320px] border-t border-white/[0.06] px-6 py-14 md:py-18">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex h-full flex-col">
            <div className="text-xs font-mono uppercase tracking-widest text-white/35">
              fromsrc
            </div>
            <div className="mt-3 text-sm text-white/40">
              Documentation framework for developers.
            </div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-white/35">
              Product
            </div>
            <div className="mt-4 flex flex-col gap-2 text-sm text-white/45">
              <Link href="/docs" className="hover:text-white transition-colors">
                documentation
              </Link>
              <Link
                href="/docs/quickstart"
                className="hover:text-white transition-colors"
              >
                quickstart
              </Link>
              <Link
                href="/docs/components/index"
                className="hover:text-white transition-colors"
              >
                components
              </Link>
              <Link
                href="/docs/examples/index"
                className="hover:text-white transition-colors"
              >
                examples
              </Link>
            </div>
            <div className="mt-6 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg font-mono text-xs text-white/60">
              bunx create-fromsrc
            </div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-white/35">
              Resources
            </div>
            <div className="mt-4 flex flex-col gap-2 text-sm text-white/45">
              <a
                href="https://github.com/fromsrc/fromsrc"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://github.com/fromsrc/fromsrc/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Discussions
              </a>
              <Link
                href="/docs/components/changelog"
                className="hover:text-white transition-colors"
              >
                Changelog
              </Link>
              <Link
                href="/llms.txt"
                className="hover:text-white transition-colors"
              >
                llms.txt
              </Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-white/35">
              Frameworks
            </div>
            <div className="mt-4 flex flex-col gap-2 font-mono text-sm text-white/45">
              <span>Next.js</span>
              <span>Vite</span>
              <span>Astro</span>
              <span>React Router</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 pt-12 mt-12 border-t border-white/[0.06] sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Logo className="size-3.5 text-white/30" />
            <span className="text-white/30 text-xs">fromsrc</span>
          </div>
          <div className="text-white/20 text-[10px] font-mono uppercase tracking-widest">
            mit license · 2026
          </div>
        </div>
      </div>
    </footer>
  );
}
