"use client";

import { useEffect, useRef, useState } from "react";
import { ACCENTS, type AccentKey } from "@/lib/theme.config";
import type { FlipThumbParams } from "@/lib/thumbnail";
import { cn } from "@/lib/utils";
import type { TreatmentProps } from "../registry";

// Only reveal the back after the cursor has dwelt this long — sweeping across
// cards won't trigger a slide.
const ENTER_DELAY = 200;

type Dir = "left" | "right" | "top" | "bottom";

function getDir(e: React.PointerEvent<HTMLElement>): Dir {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;   // 0–1 across
  const y = (e.clientY - rect.top) / rect.height;   // 0–1 down

  const d = { left: x, right: 1 - x, top: y, bottom: 1 - y };
  return (Object.keys(d) as Dir[]).reduce((a, b) => (d[a] < d[b] ? a : b));
}

// c1 exits in the direction opposite to entry; c2 enters from entry side.
function c1Exit(dir: Dir): string {
  if (dir === "left")   return "translateX(100%)";
  if (dir === "right")  return "translateX(-100%)";
  if (dir === "top")    return "translateY(100%)";
  return "translateY(-100%)";
}
function c2Rest(dir: Dir): string {
  if (dir === "left")   return "translateX(-100%)";
  if (dir === "right")  return "translateX(100%)";
  if (dir === "top")    return "translateY(-100%)";
  return "translateY(100%)";
}

function parseFlipParams(params?: Record<string, unknown>): FlipThumbParams {
  const front = params?.front as FlipThumbParams["front"] | undefined;
  const back = params?.back as FlipThumbParams["back"] | undefined;

  const rows = Array.isArray(back?.rows)
    ? back.rows
        .filter(
          (row): row is FlipThumbParams["back"]["rows"][number] =>
            !!row &&
            typeof row === "object" &&
            typeof (row as { k?: unknown }).k === "string" &&
            typeof (row as { v?: unknown }).v === "string",
        )
        .map((row) => ({ k: row.k, v: row.v, accent: row.accent === true }))
    : [];

  return {
    front: {
      label:      typeof front?.label    === "string" ? front.label    : undefined,
      sublabel:   typeof front?.sublabel === "string" ? front.sublabel : undefined,
      swatches:   Array.isArray(front?.swatches)
        ? front.swatches.filter((c): c is string => typeof c === "string") : [],
      type:       front?.type,
      button:     front?.button,
      badge:      typeof front?.badge === "string" ? front.badge : undefined,
      showToggle: front?.showToggle === true,
      input:      typeof front?.input  === "string" ? front.input  : undefined,
      showRadii:  front?.showRadii === true,
    },
    back: { heading: typeof back?.heading === "string" ? back.heading : undefined, rows },
    compact: params?.compact === true,
  };
}

function thumbAccent(accent?: AccentKey) {
  const a = ACCENTS[accent ?? "blue"];
  return {
    color:    a.dark,
    fg:       a.fgDark,
    soft:     `color-mix(in oklab, ${a.dark} 24%, transparent)`,
    softText: a.dark,
  };
}

export default function FlipCard({ active, params, accent }: TreatmentProps) {
  const { front, back, compact } = parseFlipParams(params);
  const accentTokens = thumbAccent(accent);
  const typeScale = front.type;

  const [revealed, setRevealed] = useState(false);
  const [dir, setDir] = useState<Dir>("right");
  // When dir changes pre-reveal, suppress c2's transition for one frame so it
  // snaps to the new resting position instead of animating across the viewport.
  const [c2NoTransition, setC2NoTransition] = useState(false);
  const pendingDirRef = useRef<Dir>("right"); // updated immediately on enter
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hover-intent: enter after dwell, leave immediately (0-delay stays async).
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (active) {
      timerRef.current = setTimeout(() => {
        const next = pendingDirRef.current;
        setC2NoTransition(true);  // 1. suppress transition
        setDir(next);             // 2. snap c2 to new resting position
        // Two rAFs: first lets the snap render, second re-enables transition
        // before setRevealed triggers the slide-in animation.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setC2NoTransition(false);
            setRevealed(true);
          });
        });
      }, ENTER_DELAY);
    } else {
      timerRef.current = setTimeout(() => setRevealed(false), 0);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active]);

  const transition = "transition-transform duration-450 ease-(--ease-out-soft) motion-reduce:transition-none";

  return (
    <div
      className={cn(
        "thumb-flip absolute inset-0 overflow-hidden",
        compact && "thumb-flip--compact",
      )}
      aria-hidden
      onPointerEnter={(e) => { pendingDirRef.current = getDir(e); }}
    >
      {/* c1 — front: visible at rest, slides out on hover */}
      <div
        className={cn("thumb-screen absolute inset-0 flex flex-col gap-2.75 p-3.5", transition)}
        style={{ transform: revealed ? c1Exit(dir) : "translate(0,0)" }}
      >
        {/* 1. Label row */}
        {(front.label || front.sublabel) && (
          <div className="flex items-baseline justify-between gap-2">
            {front.label && (
              <span className="font-mono text-[9px] tracking-[0.14em] text-thumb-ink-dim uppercase">
                {front.label}
              </span>
            )}
            {front.sublabel && (
              <span className="font-mono text-[8px] text-thumb-ink-faint">
                {front.sublabel}
              </span>
            )}
          </div>
        )}

        {/* 2. Swatch ramp */}
        {front.swatches.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {front.swatches.map((color, i) => (
              <span
                key={`${color}-${i}`}
                className="size-5.5 shrink-0 rounded-[5px] ring-1 ring-white/10"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}

        {/* 3. Mid row */}
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex flex-col gap-1">
            {typeScale?.display && (
              <span className="font-display text-[30px] font-medium leading-none text-thumb-ink">
                {typeScale.display}
              </span>
            )}
            {typeScale?.sample && (
              <span className="text-[11px] leading-snug text-thumb-ink-dim">
                {typeScale.sample}
              </span>
            )}
            {typeScale?.scaleLabel && (
              <span className="font-mono text-[8px] tracking-[0.08em] text-thumb-ink-faint uppercase">
                {typeScale.scaleLabel}
              </span>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {front.button?.label && (
              <span className="inline-flex items-center rounded-md border border-thumb-border px-2 py-1 font-mono text-[9px] tracking-wide text-thumb-ink">
                {front.button.label}
              </span>
            )}
            <div className="thumb-flip__badge-toggle flex flex-col items-end gap-1.5">
              {front.badge && (
                <span
                  className="rounded-full px-2 py-0.5 font-mono text-[8px] tracking-wide uppercase"
                  style={{ backgroundColor: accentTokens.soft, color: accentTokens.softText }}
                >
                  {front.badge}
                </span>
              )}
              {front.showToggle && (
                <span
                  className="relative h-4 w-7 rounded-full"
                  style={{ backgroundColor: accentTokens.color }}
                >
                  <span className="absolute top-0.5 right-0.5 h-3 w-3 rounded-full bg-white" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 4. Secondary row */}
        {(front.input || front.showRadii) && (
          <div className="thumb-flip__secondary mt-auto flex items-center justify-between gap-2">
            {front.input && (
              <span className="min-w-0 flex-1 truncate rounded-md border border-thumb-border px-2 py-1 font-mono text-[8px] text-thumb-ink-faint">
                {front.input}
              </span>
            )}
            {front.showRadii && (
              <div className="flex shrink-0 items-end gap-1">
                {[{ size: 10, radius: 2 }, { size: 12, radius: 4 }, { size: 14, radius: 9999 }].map(
                  ({ size, radius }) => (
                    <span
                      key={radius}
                      className="bg-thumb-ink-faint/25"
                      style={{ width: size, height: size, borderRadius: radius }}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* c2 — back: waits off-screen, slides in on hover */}
      <div
        className={cn("thumb-screen absolute inset-0 flex flex-col overflow-hidden p-3.5", !c2NoTransition && transition)}
        style={{ transform: revealed ? "translate(0,0)" : c2Rest(dir) }}
      >
        {back.heading && (
          <p
            className="mb-1 font-mono text-[10px] tracking-[0.14em] uppercase"
            style={{ color: accentTokens.color }}
          >
            {back.heading}
          </p>
        )}
        <div className="flex flex-1 flex-col justify-center">
          {back.rows.map((row, i) => (
            <div
              key={row.k}
              className={cn(
                "flex items-baseline justify-between gap-3 py-2",
                i > 0 && "border-t border-thumb-border",
              )}
            >
              <span className="shrink-0 font-mono text-[9px] tracking-wide text-thumb-ink-faint uppercase">
                {row.k}
              </span>
              <span
                className="text-right text-[10px] leading-snug text-thumb-ink"
                style={row.accent ? { color: accentTokens.color } : undefined}
              >
                {row.v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
