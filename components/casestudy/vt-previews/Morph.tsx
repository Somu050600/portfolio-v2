"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

const SMALL = { left: 12, top: 12, width: 104, height: 68 };
const LARGE = { left: 12, top: 12, width: 236, height: 152 };

/**
 * Simulated shared-element morph: a thumbnail card grows into a detail view
 * and back. Mirrors the card → case-study transition this site uses.
 */
export default function Morph({ runToken }: { runToken: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const expanded = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    const card = cardRef.current;
    const detail = detailRef.current;
    if (!card || !detail) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const go = (toLarge: boolean) => {
      gsap.killTweensOf([card, detail]);
      const geo = toLarge ? LARGE : SMALL;
      if (reduced) {
        gsap.set(card, { ...geo });
        gsap.set(detail, { opacity: toLarge ? 1 : 0 });
        return;
      }
      gsap.to(card, { ...geo, duration: 0.5, ease: "power3.inOut" });
      gsap.to(detail, {
        opacity: toLarge ? 1 : 0,
        duration: 0.3,
        ease: "power1.inOut",
        delay: toLarge ? 0.2 : 0,
      });
    };

    if (first.current) {
      first.current = false;
      gsap.set(card, { ...SMALL });
      gsap.set(detail, { opacity: 0 });
      go(true);
      expanded.current = true;
      return;
    }
    go(!expanded.current);
    expanded.current = !expanded.current;
  }, [runToken]);

  return (
    <div className="relative h-44 w-[260px] max-w-full rounded-lg border border-border-color bg-bg/40">
      <div
        ref={cardRef}
        className="absolute overflow-hidden rounded-md border border-border-color bg-elevated shadow-sm"
        style={{ ...SMALL }}
      >
        <div className="h-10 w-full bg-accent/20" />
        <div ref={detailRef} className="flex flex-col gap-1.5 p-2">
          <div className="h-2 w-3/4 rounded bg-ink/10" />
          <div className="h-2 w-1/2 rounded bg-ink/10" />
          <span className="font-mono text-[9px] tracking-wide text-ink-faint uppercase">
            detail
          </span>
        </div>
      </div>
      <span className="absolute right-2 bottom-2 font-mono text-[9px] tracking-wide text-ink-faint">
        view-transition-name: hero
      </span>
    </div>
  );
}
