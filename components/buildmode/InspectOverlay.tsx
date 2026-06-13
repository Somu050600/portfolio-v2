"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type HoverTarget = {
  name: string;
  note?: string;
  rect: DOMRect;
};

export default function InspectOverlay() {
  const reducedMotion = useReducedMotion();
  const [target, setTarget] = useState<HoverTarget | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const el = document
          .elementFromPoint(e.clientX, e.clientY)
          ?.closest<HTMLElement>("[data-component]");
        if (!el) {
          setTarget(null);
          return;
        }
        const rect = el.getBoundingClientRect();
        setTarget({
          name: el.dataset.component ?? "Component",
          note: el.dataset.note,
          rect,
        });
      });
    };

    const onLeave = () => setTarget(null);

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  if (!target) return null;

  const { rect, name, note } = target;

  return (
    <>
      <div
        className="pointer-events-none fixed z-[9990] border-2 border-accent motion-reduce:transition-none"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          transition: reducedMotion ? "none" : "top 80ms, left 80ms, width 80ms, height 80ms",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed z-[9991] max-w-xs rounded-md border border-border-color bg-elevated px-2.5 py-1.5 shadow-lg"
        style={{
          top: Math.max(8, rect.top - 36),
          left: Math.min(rect.left, window.innerWidth - 240),
        }}
        role="status"
        aria-live="polite"
      >
        <p className="font-mono text-[11px] tracking-wide text-ink uppercase">
          {name}
        </p>
        {note && (
          <p className="mt-0.5 text-xs leading-snug text-ink-dim">{note}</p>
        )}
      </div>
    </>
  );
}
