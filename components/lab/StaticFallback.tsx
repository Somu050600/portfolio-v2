export default function StaticFallback() {
  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-[2rem] border border-stone-300/70 bg-[#e8e1d5] shadow-2xl shadow-stone-900/10">
      {/* This is intentionally plain HTML/CSS: it is safe for reduced-motion,
          touch devices, browsers without WebGL, and SSR loading states. */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_30%,rgba(255,255,255,0.72),transparent_36%),linear-gradient(135deg,rgba(120,110,91,0.14),transparent_42%)]" />
      <div className="absolute bottom-0 left-0 h-28 w-full bg-gradient-to-t from-stone-300/80 to-transparent" />
      <div className="absolute bottom-10 left-8 h-24 w-56 -rotate-6 rounded-[48%_52%_46%_54%] bg-stone-400/70 shadow-inner shadow-stone-700/20" />
      <div className="absolute bottom-16 left-24 h-14 w-36 rotate-3 rounded-[46%_54%_55%_45%] bg-stone-500/45" />
      <div className="absolute left-8 top-8 max-w-xs">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-stone-500">Static fallback</p>
        <h2 className="mt-3 text-2xl font-serif text-stone-800">R3F lab island</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">Shown while the 3D island loads, or when motion/WebGL/pointer guards opt out.</p>
      </div>
    </div>
  );
}
