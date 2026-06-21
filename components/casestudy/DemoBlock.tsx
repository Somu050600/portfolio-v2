"use client";

import { useState } from "react";
import { demoRegistry } from "./demos/registry";

export default function DemoBlock({
  id,
  caption,
}: {
  id: string;
  caption?: string;
}) {
  const [showHow, setShowHow] = useState(false);
  const entry = demoRegistry[id];
  if (!entry) return null;

  const { label, Component, how } = entry;

  return (
    <figure className="not-prose overflow-hidden rounded-xl border border-border-color bg-surface">
      <div className="flex items-center justify-between border-b border-border-color px-4 py-2">
        <span className="font-mono text-[10px] tracking-[0.15em] text-ink-faint uppercase">
          {label}
        </span>
        <button
          type="button"
          onClick={() => setShowHow((v) => !v)}
          aria-expanded={showHow}
          className="font-mono text-[11px] text-ink-dim transition-colors hover:text-accent"
        >
          {showHow ? "Hide" : "How it works"}
          <span aria-hidden> {showHow ? "−" : "+"}</span>
        </button>
      </div>

      <div className="p-5">
        <Component />
      </div>

      {caption && (
        <figcaption className="px-4 pb-3 font-mono text-[10px] tracking-wide text-ink-faint">
          {caption}
        </figcaption>
      )}

      {showHow && (
        <div className="border-t border-border-color bg-bg/40 px-4 py-4">
          <p className="mb-3 text-sm leading-relaxed text-ink-dim">{how.note}</p>
          <pre className="overflow-x-auto rounded-lg border border-border-color bg-bg p-3">
            <code className="font-mono text-[12px] leading-relaxed text-ink-dim">
              {how.code}
            </code>
          </pre>
        </div>
      )}
    </figure>
  );
}
