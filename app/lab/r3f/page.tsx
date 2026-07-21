"use client";

import dynamic from "next/dynamic";
import StaticFallback from "@/components/lab/StaticFallback";

const R3FIsland = dynamic(() => import("@/components/lab/R3FIsland"), {
  ssr: false,
  loading: () => <StaticFallback />,
});

export default function R3FLabPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#d9d2c5] text-stone-900">
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 md:px-12">
        <div className="absolute left-8 top-8 font-mono text-sm uppercase tracking-[0.45em] text-stone-700">SOMU</div>
        <div className="absolute right-8 top-8 hidden gap-12 font-mono text-sm tracking-[0.22em] text-stone-700 md:flex">
          <span>Work</span><span>Photography</span><span>About</span><span>Contact</span>
        </div>

        <div className="grid w-full grid-cols-1 items-end gap-10 lg:grid-cols-[minmax(320px,0.42fr)_1fr]">
          <div className="order-2 h-[42vh] min-h-[340px] max-w-xl lg:order-1 lg:h-[48vh]">
            <R3FIsland />
          </div>

          <div className="order-1 max-w-3xl justify-self-center text-center lg:order-2">
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.35em] text-stone-600">Temporary lab route — delete or promote later</p>
            <h1 className="font-serif text-5xl leading-tight text-stone-900 md:text-7xl">
              React Three Fiber canvas island
            </h1>
            <p className="mx-auto mt-6 max-w-xl font-mono text-sm leading-7 tracking-[0.18em] text-stone-600">
              A contained, lazy 3D stage for learning demand rendering, loading covers, and fallback guards before touching the live landing.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
