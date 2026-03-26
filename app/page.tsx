import { Bento } from "./components/bento";
import { Features } from "./components/features";
import { Foot } from "./components/foot";
import { Hero } from "./components/hero";
import { Nav } from "./components/nav";

const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default function Page() {
  return (
    <main
      className="relative isolate min-h-dvh overflow-x-hidden text-white selection:bg-white/20 selection:text-white"
      style={{ background: "#0a0a0a", fontFamily: font }}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden md:block">
        <div className="mx-auto h-full max-w-[1320px] border-x border-x-white/[0.06]" />
      </div>
      <div className="relative z-10">
        <Nav />
        <Hero />
        <Features />
        <Bento />
        <Foot />
      </div>
    </main>
  );
}
