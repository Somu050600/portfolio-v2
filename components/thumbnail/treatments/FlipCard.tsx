"use client";

import { useEffect, useState } from "react";
import { ACCENTS, type AccentKey } from "@/lib/theme.config";
import type { FlipThumbParams } from "@/lib/thumbnail";
import { cn } from "@/lib/utils";
import type { TreatmentProps } from "../registry";

// Hover-intent delay: only flip to the back once the cursor has lingered this
// long, so sweeping across cards doesn't trigger a burst of distracting flips.
const FLIP_ENTER_DELAY = 200;

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
        .map((row) => ({
          k: row.k,
          v: row.v,
          accent: row.accent === true,
        }))
    : [];

  return {
    front: {
      label: typeof front?.label === "string" ? front.label : undefined,
      sublabel: typeof front?.sublabel === "string" ? front.sublabel : undefined,
      swatches: Array.isArray(front?.swatches)
        ? front.swatches.filter((c): c is string => typeof c === "string")
        : [],
      type: front?.type,
      button: front?.button,
      badge: typeof front?.badge === "string" ? front.badge : undefined,
      showToggle: front?.showToggle === true,
      input: typeof front?.input === "string" ? front.input : undefined,
      showRadii: front?.showRadii === true,
    },
    back: {
      heading: typeof back?.heading === "string" ? back.heading : undefined,
      rows,
    },
    compact: params?.compact === true,
  };
}

function thumbAccent(accent?: AccentKey) {
  const a = ACCENTS[accent ?? "blue"];
  return {
    color: a.dark,
    fg: a.fgDark,
    soft: `color-mix(in oklab, ${a.dark} 24%, transparent)`,
    softText: a.dark,
  };
}

export default function FlipCard({
  active,
  params,
  accent,
}: TreatmentProps) {
  const { front, back, compact } = parseFlipParams(params);
  const accentTokens = thumbAccent(accent);
  const typeScale = front.type;

  // Debounce the hover-driven flip: enter only after a brief dwell, leave
  // immediately. A quick cursor sweep cancels the pending enter before it
  // fires, so it never flips.
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(
      () => setFlipped(active),
      active ? FLIP_ENTER_DELAY : 0,
    );
    return () => clearTimeout(id);
  }, [active]);

  return (
    <div
      className={cn(
        "thumb-flip absolute inset-0 perspective-[900px]",
        compact && "thumb-flip--compact",
      )}
      aria-hidden
    >
      <div
        className={cn(
          "relative h-full w-full transform-3d transition-transform duration-500 ease-(--ease-out-soft) motion-reduce:transition-none",
          flipped && "motion-safe:rotate-y-180",
        )}
      >
        {/* Front — living tokens artboard */}
        <div className="thumb-screen absolute inset-0 flex flex-col gap-[11px] backface-hidden p-3.5">
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
                  className={cn(
                    "h-[22px] w-[22px] shrink-0 rounded-[5px] ring-1 ring-white/10",
                    flipped &&
                      "motion-safe:animate-[thumb-flip-swatch-pulse_1.4s_ease-in-out_infinite]",
                  )}
                  style={{
                    backgroundColor: color,
                    animationDelay: flipped ? `${i * 80}ms` : undefined,
                    ["--swatch-glow" as string]: color,
                  }}
                />
              ))}
            </div>
          )}

          {/* 3. Mid row — type + component cluster */}
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex flex-col gap-1">
              {typeScale?.display && (
                <span className="font-serif text-[30px] font-light leading-none text-thumb-ink">
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
                    style={{
                      backgroundColor: accentTokens.soft,
                      color: accentTokens.softText,
                    }}
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

          {/* 4. Secondary row — input + radii */}
          {(front.input || front.showRadii) && (
            <div className="thumb-flip__secondary mt-auto flex items-center justify-between gap-2">
              {front.input && (
                <span className="min-w-0 flex-1 truncate rounded-md border border-thumb-border px-2 py-1 font-mono text-[8px] text-thumb-ink-faint">
                  {front.input}
                </span>
              )}
              {front.showRadii && (
                <div className="flex shrink-0 items-end gap-1">
                  {[
                    { size: 10, radius: 2 },
                    { size: 12, radius: 4 },
                    { size: 14, radius: 9999 },
                  ].map(({ size, radius }) => (
                    <span
                      key={radius}
                      className="bg-thumb-ink-faint/25"
                      style={{ width: size, height: size, borderRadius: radius }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Back — spec sheet */}
        <div className="thumb-screen absolute inset-0 flex flex-col backface-hidden rotate-y-180 overflow-hidden p-3.5">
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
    </div>
  );
}
