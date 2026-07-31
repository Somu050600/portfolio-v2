"use client";

import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import {
  caseStudyArtifact,
  caseStudyCodeBody,
  caseStudyCodeHeader,
  caseStudyCodeNote,
  caseStudyCodeToggle,
  caseStudyDarkSurface,
} from "./case-study-classes";

const COLLAPSED = 96; // 6rem peek
const EXPANDED_MAX = 384; // 24rem

/**
 * An expandable code block: a clamped peek with a gradient fade and a floating
 * toggle, expanding (GSAP height tween) to a scrollable max height. Shared by
 * DemoBlock and VTLab.
 */
export default function CodePeek({
  note,
  code,
}: {
  note?: string;
  code: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    const target = expanded
      ? Math.min(el.scrollHeight, EXPANDED_MAX)
      : COLLAPSED;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (firstRun.current || reduced) {
      firstRun.current = false;
      gsap.set(el, { maxHeight: target });
      el.style.overflowY = expanded ? "auto" : "hidden";
      return;
    }

    gsap.killTweensOf(el);
    el.style.overflowY = "hidden";
    gsap.to(el, {
      maxHeight: target,
      duration: expanded ? 0.4 : 0.3,
      ease: expanded ? "power2.out" : "power2.in",
      onComplete: () => {
        if (expanded) el.style.overflowY = "auto";
      },
    });
  }, [expanded]);

  return (
    <div
      className={cn(
        "relative",
        caseStudyDarkSurface,
        caseStudyArtifact,
      )}
    >
      <div className={caseStudyCodeHeader}>
        <span>implementation.tsx</span>
        <span>{expanded ? "open" : "preview"}</span>
      </div>
      <div
        ref={divRef}
        data-lenis-prevent
        className="overflow-hidden"
        style={{ maxHeight: COLLAPSED }}
      >
        {note && <p className={caseStudyCodeNote}>{note}</p>}
        <pre className={caseStudyCodeBody}>
          <code className="whitespace-pre">
            {code}
          </code>
        </pre>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-20 transition-opacity duration-200",
          "bg-linear-to-t from-thumb-bg to-transparent",
          expanded && "opacity-0",
        )}
      />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={caseStudyCodeToggle}
      >
        {expanded ? "Collapse ↑" : "Show code ↓"}
      </button>
    </div>
  );
}
