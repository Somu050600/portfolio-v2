"use client";

import { useEffect, useRef } from "react";
import { landingConfig } from "@/lib/landing.config";

/**
 * Bottom-left live clock + status line. Time is written straight to the DOM
 * via ref (no state) so the 1s tick never re-renders the tree. Rendered as
 * `--:--:--` on the server to avoid a hydration mismatch.
 */
export default function StatusClock() {
  const clockRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tick = () => {
      const el = clockRef.current;
      if (!el) return;
      const now = new Date();
      const h12 = ((now.getHours() + 11) % 12) + 1;
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      const ampm = now.getHours() >= 12 ? "PM" : "AM";
      el.textContent = `${h12}:${mm}:${ss} ${ampm}`;
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!landingConfig.statusClock.enabled) return null;

  return (
    <div className="absolute bottom-6 left-6 z-20 font-mono text-[11px] tracking-[0.18em] text-white/45 select-none md:bottom-8 md:left-8">
      <span ref={clockRef}>--:--:-- --</span>
      <span className="mt-1 block uppercase">
        <span className="status-dot" aria-hidden="true" />
        {landingConfig.statusClock.statusLabel}
      </span>
    </div>
  );
}
