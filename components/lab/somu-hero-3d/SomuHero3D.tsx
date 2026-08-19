"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MutableRefObject, PointerEvent } from "react";

export type SomuPointerTarget = MutableRefObject<{ x: number; y: number }>;

const SomuHeroScene = dynamic(() => import("./SomuHeroScene"), {
  ssr: false,
  loading: () => <StillLifeFallback dimmed />,
});

const navItems = ["Work", "Photography", "About", "Contact"];
const specialties = ["React", "Next.js", "Design Systems", "Photography"];

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function StillLifeFallback({ dimmed = false }: { dimmed?: boolean }) {
  return (
    <div aria-hidden="true" className={`absolute inset-0 overflow-hidden bg-[#c4bca9] transition-opacity duration-700 ${dimmed ? "opacity-70" : "opacity-100"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_56%_30%,#efeadd_0%,#d9d2c1_55%,#c1b9a6_100%)]" />
      <Image src="/lab/somu-hero-3d/stilllife.png" alt="" width={500} height={956} priority className="absolute bottom-0 left-0 h-[86vh] min-h-[560px] w-auto max-w-none object-contain opacity-90 mix-blend-multiply md:h-[96vh]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_41%,rgba(255,244,220,0.28),transparent_32%),linear-gradient(90deg,rgba(46,43,37,0.1),transparent_38%,rgba(46,43,37,0.14))]" />
    </div>
  );
}

function FocusBracket({ corner, className }: { corner: "tl" | "tr" | "bl" | "br"; className: string }) {
  const borderClass = { tl: "border-l border-t", tr: "border-r border-t", bl: "border-b border-l", br: "border-b border-r" }[corner];
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute z-[6] h-[38px] w-[38px] border-[#2e2b25]/55 transition-transform duration-300 ${borderClass} ${className}`}>
      {corner === "br" ? <span className="absolute -bottom-0.5 -right-0.5 h-[7px] w-[7px] rounded-full bg-[#6b7245] opacity-90" /> : null}
    </div>
  );
}

export default function SomuHero3D() {
  const target = useRef({ x: 0, y: 0 });
  const rootRef = useRef<HTMLElement | null>(null);
  const [reduced, setReduced] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [canRender3D] = useState(() => (typeof document === "undefined" ? false : hasWebGL()));

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(reduceMotion.matches);
    reduceMotion.addEventListener("change", onChange);
    return () => reduceMotion.removeEventListener("change", onChange);
  }, []);

  function setParallaxVars(x: number, y: number) {
    rootRef.current?.style.setProperty("--hero-x", x.toFixed(4));
    rootRef.current?.style.setProperty("--hero-y", y.toFixed(4));
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    target.current.x = x;
    target.current.y = y;
    setParallaxVars(x, y);
  }

  function resetPointer() {
    target.current.x = 0;
    target.current.y = 0;
    setParallaxVars(0, 0);
  }

  function toggleReduced() {
    setReduced((current) => {
      const next = !current;
      if (next) resetPointer();
      return next;
    });
  }

  const parallaxStyle = { "--hero-x": 0, "--hero-y": 0 } as CSSProperties;

  return (
    <main className="min-h-screen overflow-hidden bg-[#c9c2b3] text-[#2e2b25]">
      <section ref={rootRef} className="relative min-h-[max(560px,100svh)] overflow-hidden bg-[#c9c2b3] px-6 py-6 font-mono md:px-12 md:py-8" style={parallaxStyle} onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
        <StillLifeFallback />
        {canRender3D ? <SomuHeroScene reduced={reduced} target={target as SomuPointerTarget} /> : null}
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[42%] z-[3] aspect-square w-[min(120vh,66vw)] -translate-x-1/2 -translate-y-1/2"><div className="absolute inset-0 rounded-full border border-[#2e2b25]/10" /><div className="absolute inset-[9%] rounded-full border border-[#2e2b25]/[0.07]" /></div>
        <FocusBracket corner="tl" className="left-[clamp(20px,26vw,420px)] top-[clamp(16px,30vh,300px)] translate-x-[calc(var(--hero-x)*-12px)] translate-y-[calc(var(--hero-y)*-10px)]" />
        <FocusBracket corner="tr" className="right-[clamp(20px,26vw,420px)] top-[clamp(16px,30vh,300px)] translate-x-[calc(var(--hero-x)*12px)] translate-y-[calc(var(--hero-y)*-10px)]" />
        <FocusBracket corner="bl" className="bottom-[clamp(16px,26vh,260px)] left-[clamp(20px,26vw,420px)] translate-x-[calc(var(--hero-x)*-12px)] translate-y-[calc(var(--hero-y)*10px)]" />
        <FocusBracket corner="br" className="bottom-[clamp(16px,26vh,260px)] right-[clamp(20px,26vw,420px)] translate-x-[calc(var(--hero-x)*12px)] translate-y-[calc(var(--hero-y)*10px)]" />
        <header className="relative z-[8] flex items-start justify-between gap-6"><Link href="/home" className="pl-[0.42em] text-xl font-medium uppercase tracking-[0.42em] md:text-2xl">SOMU</Link><nav className="hidden flex-wrap gap-8 text-sm tracking-[0.02em] md:flex lg:gap-11">{navItems.map((item) => <Link key={item} href="/home" className="transition-colors duration-200 hover:text-[#6b7245]">{item}</Link>)}</nav></header>
        <div className="pointer-events-none absolute left-1/2 top-[47%] z-[7] w-[min(760px,86vw)] -translate-x-1/2 -translate-y-1/2 text-center [transform:translate(calc(-50%_+_var(--hero-x)_*_18px),calc(-50%_+_var(--hero-y)_*_10px))] motion-safe:transition-transform motion-safe:duration-300"><h1 className="text-balance font-serif text-[clamp(2.2rem,5vw,4.5rem)] font-normal leading-[1.06]">Engineering interfaces with a <span className="text-[#6b7245]">photographer&apos;s eye</span> for focus, framing, and <span className="text-[#6b7245] italic">detail</span>.</h1><p className="mt-[clamp(1.375rem,3.4vh,2.125rem)] text-[clamp(0.875rem,1.2vw,1.0625rem)] tracking-[0.08em] text-[#3a362d]">Frontend Engineer</p></div>
        <div className="absolute bottom-6 left-6 z-[8] flex max-w-[22rem] flex-col gap-3 text-xs uppercase tracking-[0.18em] text-[#3a362d]/80 md:bottom-8 md:left-12"><span>Selected focus</span><div className="flex flex-wrap gap-2 normal-case tracking-normal">{specialties.map((skill) => <span key={skill} className="rounded-full border border-[#2e2b25]/20 bg-[#efeadd]/30 px-3 py-1 text-[0.7rem] uppercase tracking-[0.12em] backdrop-blur-sm">{skill}</span>)}</div></div>
        <button type="button" onClick={toggleReduced} className="absolute bottom-6 right-6 z-[9] inline-flex items-center gap-3 rounded-full border border-[#2e2b25]/20 bg-[#efeadd]/40 px-4 py-2 text-xs uppercase tracking-[0.14em] backdrop-blur-md transition-colors hover:bg-[#efeadd]/65 md:bottom-8 md:right-12" aria-pressed={reduced}>Motion<span className={`inline-flex h-5 w-[38px] items-center rounded-full p-0.5 transition-colors duration-300 ${reduced ? "bg-[#2e2b25]/25" : "bg-[#6b7245]"}`}><span className={`h-4 w-4 rounded-full bg-[#efeadd] shadow-sm transition-transform duration-300 ${reduced ? "translate-x-0" : "translate-x-[18px]"}`} /></span></button>
      </section>
    </main>
  );
}
