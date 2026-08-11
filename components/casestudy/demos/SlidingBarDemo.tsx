"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const ITEMS = ["Work", "Experience", "About", "Playground"];
const STEP = 40; // px between item centers (row height + gap)
const BAR_H = 16;

type SlidingBarDemoProps = {
  /** Autoplay mode (thumbnail): a synthetic cursor moves + clicks on a loop. */
  autoplay?: boolean;
  /** In autoplay, only run the loop while active (e.g. card hovered). */
  active?: boolean;
  className?: string;
};

export default function SlidingBarDemo({
  autoplay = false,
  active = true,
  className,
}: SlidingBarDemoProps) {
  // activeIndex drives the bar (moves on click). cursorIndex drives the cursor
  // (moves first, then clicks), kept separate so the bar doesn't follow the
  // cursor's arrival, only its click.
  const [activeIndex, setActiveIndex] = useState(0);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [clicking, setClicking] = useState(false);
  const timers = useRef<number[]>([]);
  const cursorShown = autoplay && active;

  // Autoplay loop: cursor glides to an item, THEN clicks (bar slides), repeat.
  // All state updates happen inside timeouts or the cleanup, never in the
  // effect body (avoids cascading renders).
  useEffect(() => {
    if (!autoplay || !active) return;

    const queue = timers.current;
    let i = 0;

    const tick = () => {
      i = (i + 1) % ITEMS.length;
      setCursorIndex(i); // 1. cursor glides to the next item
      // 2. once it arrives, click, and only now does the bar move
      queue.push(
        window.setTimeout(() => {
          setClicking(true);
          setActiveIndex(i);
        }, 540),
      );
      queue.push(window.setTimeout(() => setClicking(false), 780));
      queue.push(window.setTimeout(tick, 1600));
    };

    queue.push(window.setTimeout(tick, 700));

    return () => {
      queue.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      setActiveIndex(0);
      setCursorIndex(0);
      setClicking(false);
    };
  }, [autoplay, active]);

  const onItemClick = (i: number) => {
    if (autoplay) return;
    setActiveIndex(i);
    setClicking(true);
    window.setTimeout(() => setClicking(false), 220);
  };

  return (
    <div
      className={cn(
        "relative w-full select-none rounded-xl border border-border-color bg-elevated p-4",
        className,
      )}
      aria-hidden
    >
      <p className="mb-3 font-mono text-metadata tracking-[0.18em] text-ink-faint uppercase">
        Explore
      </p>

      <div className="relative" style={{ height: ITEMS.length * STEP }}>
        {/* sliding accent bar, follows activeIndex (the click), not the cursor */}
        <span
          className="pointer-events-none absolute left-0 z-10 w-0.5 rounded-full bg-accent"
          style={{
            height: BAR_H,
            top: (STEP - BAR_H) / 2 - 3,
            transform: `translateY(${activeIndex * STEP}px)`,
            transition: "transform 300ms var(--ease-out-soft)",
          }}
        />

        {ITEMS.map((label, i) => {
          const isActive = i === activeIndex;
          // In autoplay, show a hover highlight on the item the cursor is over
          // (before it clicks). Mirrors real hover, distinct from active.
          const isCursorOver = autoplay && i === cursorIndex && !isActive;
          return (
            <button
              key={label}
              type="button"
              tabIndex={-1}
              onClick={() => onItemClick(i)}
              className={cn(
                "flex w-full items-center rounded-lg px-3 font-mono text-[13px] tracking-wide transition-colors",
                autoplay ? "cursor-default" : "cursor-pointer",
                isActive
                  ? "text-accent bg-surface"
                  : isCursorOver
                    ? "text-ink bg-surface"
                    : cn("text-ink-dim", !autoplay && "hover:text-ink"),
              )}
              style={{ height: STEP - 6, marginBottom: 6 }}
            >
              {label}
            </button>
          );
        })}

        {/* synthetic cursor (autoplay only) */}
        {autoplay && (
          <span
            className="pointer-events-none absolute z-20"
            style={{
              left: 64,
              top: STEP / 2 - 2,
              transform: `translateY(${cursorIndex * STEP}px) scale(${clicking ? 0.82 : 1})`,
              opacity: cursorShown ? 1 : 0,
              transition:
                "transform 320ms var(--ease-out-soft), opacity 200ms linear",
            }}
          >
            {/* click ripple */}
            <span
              className="absolute -left-1 -top-1 h-6 w-6 rounded-full border border-accent"
              style={{
                opacity: clicking ? 0.6 : 0,
                transform: clicking ? "scale(1.3)" : "scale(0.4)",
                transition: "transform 240ms ease-out, opacity 240ms ease-out",
              }}
            />
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 2l9 6-4 1.2L6 14 3 2z"
                className="fill-ink stroke-bg"
                strokeWidth="1"
              />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}
