"use client";

import { useRef } from "react";
import { usePageTransition } from "@/lib/page-transition-context";

/**
 * Back-to-landing button. Plays the reverse circle transition: the current
 * page shrinks away as a circle back toward this button, revealing `/`.
 */
export default function BackButton() {
  const cover = usePageTransition();
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={() =>
        cover({ href: "/", originEl: btnRef.current, direction: "backward" })
      }
      aria-label="Back to landing"
      className="group flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-foreground/50 transition-colors hover:text-foreground/90"
    >
      <span
        aria-hidden="true"
        className="transition-transform group-hover:-translate-x-1"
      >
        ←
      </span>
      back
    </button>
  );
}
