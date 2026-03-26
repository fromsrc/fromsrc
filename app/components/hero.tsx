"use client";

import { useState } from "react";

import { files } from "./heroitems";

function Stage({ children }: { readonly children: React.ReactNode }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/[0.06] p-4 sm:p-6 md:p-10"
      style={{
        backgroundColor: "#b8b8b8",
        backgroundImage:
          "radial-gradient(900px 420px at 26% 18%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 62%), radial-gradient(720px 520px at 82% 72%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 58%), linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 55%)",
        boxShadow:
          "0 50px 90px rgba(0, 0, 0, 0.55), 0 2px 0 rgba(255, 255, 255, 0.06) inset, 0 -1px 0 rgba(0, 0, 0, 0.24) inset",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAP0lEQVR4nO3QoQkAIBAEwZ//aQ0YzZzJq8M0p7oJ9A8jzq0AAACAvw9Yx0n4Kkq6qgAAAAAAAAAAAPw4b8m8wN8bK9yS8yZ0bA9x5wAAc2u7oQAAAABJRU5ErkJggg==")',
          mixBlendMode: "overlay",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative">{children}</div>
    </div>
  );
}

function Window({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0A0A0A] shadow-[0_40px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/5">
      {children}
    </div>
  );
}

export function Hero() {
  const [active, setActive] = useState(0);
  const current = files[active];

  return (
    <section className="relative overflow-hidden pt-24 pb-0 sm:pt-32 md:pt-44 md:pb-0">
      <div className="mx-auto max-w-[1320px] px-6">
        <div className="max-w-[740px]">
          <h1
            className="text-[2.25rem] font-semibold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl leading-[1.03]"
            style={{ color: "#bbb" }}
          >
            Docs, from source.
          </h1>
          <p className="mt-5 text-base text-[#888] leading-relaxed max-w-lg">
            Full control over your docs. No content layer abstraction. No vendor
            lock-in. Just MDX, components, and builds that work at any scale.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-xs text-white/70 sm:px-5 sm:py-3 sm:text-sm">
            <span className="text-white/40">$</span>
            <span>bunx create-fromsrc</span>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-[1320px] px-6 sm:mt-24 md:mt-44 md:px-0">
        <Stage>
          <div className="mx-auto w-full max-w-[1160px]">
            <Window>
              <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] bg-black/15 px-3 py-2">
                <div
                  className="flex min-w-0 items-center gap-1 overflow-x-auto"
                  role="tablist"
                >
                  {files.map((file, i) => (
                    <button
                      key={file.name}
                      type="button"
                      role="tab"
                      aria-selected={active === i}
                      onClick={() => setActive(i)}
                      className={`shrink-0 rounded-sm border px-2.5 py-1 text-[11px] transition-colors duration-150 ${
                        active === i
                          ? "border-white/20 bg-white/[0.08] text-white/85"
                          : "border-transparent text-white/40 hover:border-white/10 hover:text-white/65"
                      }`}
                    >
                      {file.name}
                    </button>
                  ))}
                </div>
                <div className="hidden shrink-0 items-center gap-2 text-[11px] font-mono text-white/40 sm:flex">
                  <span className="inline-flex size-1.5 rounded-full bg-white/50" />
                  ready
                </div>
              </div>

              {current && (
                <div className="h-[340px] md:h-[380px] overflow-auto px-5 py-4 font-mono text-[13px] leading-[1.65]">
                  <div className="flex min-w-0">
                    <div
                      className="pr-5 text-white/15 text-right select-none mr-5 tabular-nums"
                      aria-hidden="true"
                    >
                      {current.lines.map((line) => (
                        <div key={line.num}>{line.num}</div>
                      ))}
                    </div>
                    <pre className="overflow-x-auto flex-1 text-white/70 whitespace-pre">
                      {current.lines.map((line) => (
                        <div key={line.num}>{line.content}</div>
                      ))}
                    </pre>
                  </div>
                </div>
              )}
            </Window>
          </div>
        </Stage>
      </div>
    </section>
  );
}
