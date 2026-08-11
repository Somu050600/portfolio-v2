"use client";

import { cn } from "@/lib/utils";
import { useState, type ComponentType } from "react";
import { caseStudyArtifact } from "./case-study-classes";
import CodePeek from "./CodePeek";
import Clip from "./vt-previews/Clip";
import CrossFade from "./vt-previews/CrossFade";
import ListReorder from "./vt-previews/ListReorder";
import Morph from "./vt-previews/Morph";
import Slide from "./vt-previews/Slide";

type PreviewProps = { runToken: number };

type Variant = {
  key: string;
  label: string;
  Preview: ComponentType<PreviewProps>;
  note: string;
  code: string;
};

const VARIANTS: Variant[] = [
  {
    key: "cross-fade",
    label: "Cross-fade",
    Preview: CrossFade,
    note: "The default. With no view-transition-name on anything, the browser snapshots the whole page as one image (root) and cross-fades old → new. Free: you get it just by wrapping the DOM change.",
    code: `// the entire default transition
document.startViewTransition(() => {
  // swap the DOM however you like
  renderNewView();
});`,
  },
  {
    key: "morph",
    label: "Morph",
    Preview: Morph,
    note: "Shared-element transition. Tag an element on both pages with the same view-transition-name and the browser interpolates its position and size between them.",
    code: `/* both pages */
.card, .detail-hero { view-transition-name: hero; }`,
  },
  {
    key: "clip",
    label: "Clip reveal",
    Preview: Clip,
    note: "Animate the new snapshot's clip-path, e.g. a circle growing from the click point, for a reveal instead of a fade.",
    code: `::view-transition-new(root) {
  animation: reveal 0.5s ease;
}
@keyframes reveal {
  from { clip-path: circle(0% at var(--x) var(--y)); }
}`,
  },
  {
    key: "slide",
    label: "Slide",
    Preview: Slide,
    note: "Give old and new their own keyframes, one sliding out and the other in, for a directional push between views.",
    code: `::view-transition-old(root) { animation: slide-out 0.4s; }
::view-transition-new(root) { animation: slide-in 0.4s; }`,
  },
  {
    key: "reorder",
    label: "List reorder",
    Preview: ListReorder,
    note: "Give each list item a unique view-transition-name. When the order changes inside a transition, every item animates from its old slot to its new one.",
    code: `li { view-transition-name: var(--item-name); }
// reorder inside startViewTransition → items glide`,
  },
];

export default function VTLab() {
  const [activeKey, setActiveKey] = useState(VARIANTS[0].key);
  const [runToken, setRunToken] = useState(0);

  const variant = VARIANTS.find((v) => v.key === activeKey) ?? VARIANTS[0];
  const { Preview } = variant;

  const select = (key: string) => {
    setActiveKey(key);
    setRunToken((t) => t + 1); // autoplay the newly selected variant
  };

  return (
    <figure
      data-cs-artifact
      className={cn(
        "not-prose overflow-hidden rounded-xl border border-border-color bg-surface",
        caseStudyArtifact,
      )}
    >
      {/* tabs */}
      <div
        role="tablist"
        aria-label="View Transition variants"
        className="flex flex-wrap gap-1 border-b border-border-color px-3 py-2"
      >
        {VARIANTS.map((v) => {
          const active = v.key === activeKey;
          return (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => select(v.key)}
              className={cn(
                "rounded-full px-3 py-1 font-mono text-[11px] tracking-wide transition-colors",
                active
                  ? "bg-accent-soft text-accent"
                  : "text-ink-dim hover:text-ink",
              )}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      {/* preview stage */}
      <div
        className="relative flex min-h-56 items-center justify-center bg-bg p-6"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--border-color) 1px, transparent 1px)",
          backgroundSize: "15px 15px",
        }}
      >
        <span className="absolute top-3 left-3 rounded-full border border-border-color bg-surface/80 px-2 py-0.5 font-mono text-metadata tracking-[0.12em] text-ink-faint uppercase backdrop-blur-sm">
          Simulated preview
        </span>
        <button
          type="button"
          onClick={() => setRunToken((t) => t + 1)}
          className="absolute top-3 right-3 rounded-full border border-border-color bg-surface px-3 py-1 font-mono text-[11px] text-ink-dim shadow-sm transition-colors hover:border-ink-faint hover:text-accent"
        >
          {runToken === 0 ? "Run ▶" : "Replay ↻"}
        </button>

        {/* key=activeKey remounts on tab change (fresh state); runToken prop
            drives replays within a tab so previews can persist state. */}
        <div className="flex justify-center">
          <Preview key={activeKey} runToken={runToken} />
        </div>
      </div>

      <CodePeek key={activeKey} note={variant.note} code={variant.code} />
    </figure>
  );
}
