"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ACCENTS, THEME_DEFAULTS, type AccentKey } from "@/lib/theme.config";
import { useFinePointer, useReducedMotion } from "@/lib/use-reduced-motion";
import { componentAttrs } from "@/lib/build-mode";
import { cn } from "@/lib/utils";

const MODES = ["spotlight", "magnetic", "decode", "swell"] as const;
type Mode = (typeof MODES)[number];

const SAMPLE =
  "Interfaces should feel inevitable — like they were always meant to move this way.";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function readAccentRGB(): string {
  if (typeof window === "undefined") return "184,84,35";
  try {
    const stored = JSON.parse(localStorage.getItem("theme-accents") ?? "{}");
    const mode = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    const key = (
      mode === "dark"
        ? stored.darkAccent ?? THEME_DEFAULTS.darkAccent
        : stored.lightAccent ?? THEME_DEFAULTS.lightAccent
    ) as AccentKey;
    const hex = ACCENTS[key][mode].replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `${r},${g},${b}`;
  } catch {
    return "184,84,35";
  }
}

export default function TypeLab() {
  const [mode, setMode] = useState<Mode>("spotlight");
  const containerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const chars = useMemo(() => SAMPLE.split(""), []);

  useEffect(() => {
    if (reducedMotion || !finePointer) return;
    const container = containerRef.current;
    if (!container) return;
    const charEls = charRefs.current;

    let px = -9999;
    let py = -9999;
    let inside = false;
    let raf = 0;
    let accentRGB = readAccentRGB();

    const onAccent = () => {
      accentRGB = readAccentRGB();
    };
    window.addEventListener("theme:accent-change", onAccent);

    type State = { el: HTMLSpanElement; cx: number; cy: number; t: number };
    const states: State[] = [];

    const measure = () => {
      const base = container.getBoundingClientRect();
      states.length = 0;
      for (const el of charEls) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        states.push({
          el,
          cx: r.left + r.width / 2 - base.left,
          cy: r.top + r.height / 2 - base.top,
          t: 1,
        });
      }
    };

    const onPointer = (e: PointerEvent) => {
      const base = container.getBoundingClientRect();
      px = e.clientX - base.left;
      py = e.clientY - base.top;
    };

    const tick = () => {
      for (const c of states) {
        const d = Math.hypot(c.cx - px, c.cy - py);
        const prox = inside ? Math.max(0, 1 - d / 140) : 0;

        if (mode === "spotlight") {
          const bright = inside ? 0.35 + 0.65 * prox : 1;
          c.t += (bright - c.t) * 0.18;
          c.el.style.opacity = c.t.toFixed(3);
          c.el.style.textShadow =
            prox > 0.05
              ? `0 0 ${(12 * prox).toFixed(1)}px rgba(${accentRGB},${(0.7 * prox).toFixed(2)})`
              : "none";
          c.el.style.transform = "";
        } else if (mode === "magnetic") {
          const pull = inside ? prox * 14 : 0;
          const ang = Math.atan2(py - c.cy, px - c.cx);
          const tx = Math.cos(ang) * pull;
          const ty = Math.sin(ang) * pull;
          c.el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
          c.el.style.opacity = "1";
          c.el.style.textShadow = "none";
        } else if (mode === "swell") {
          const scale = 1 + prox * 0.45;
          c.el.style.transform = `scale(${scale.toFixed(3)})`;
          c.el.style.opacity = (0.55 + prox * 0.45).toFixed(3);
          c.el.style.textShadow = "none";
        } else {
          c.el.style.opacity = "1";
          c.el.style.transform = "";
          c.el.style.textShadow = "none";
        }
      }
      raf = requestAnimationFrame(tick);
    };

    measure();
    raf = requestAnimationFrame(tick);

    container.addEventListener("pointermove", onPointer);
    container.addEventListener("pointerenter", () => {
      inside = true;
    });
    container.addEventListener("pointerleave", () => {
      inside = false;
    });
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("theme:accent-change", onAccent);
      container.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", measure);
      for (const el of charEls) {
        if (el) {
          el.style.opacity = "";
          el.style.transform = "";
          el.style.textShadow = "";
        }
      }
    };
  }, [mode, reducedMotion, finePointer, chars]);

  // Decode scramble on mode switch
  useEffect(() => {
    if (mode !== "decode" || reducedMotion) return;
    const charEls = charRefs.current;
    const targets = chars;
    const timers: number[] = [];

    charEls.forEach((el, i) => {
      if (!el || targets[i] === " ") return;
      let frame = 0;
      const max = 12 + (i % 5) * 2;
      const id = window.setInterval(() => {
        frame++;
        if (frame >= max) {
          el.textContent = targets[i];
          clearInterval(id);
          return;
        }
        el.textContent =
          CHARSET[Math.floor(Math.random() * CHARSET.length)] ?? targets[i];
      }, 40);
      timers.push(id);
    });

    return () => timers.forEach(clearInterval);
  }, [mode, reducedMotion, chars]);

  return (
    <div
      className="flex flex-col gap-8"
      {...componentAttrs(
        "TypeLab",
        "Per-char type modes — spotlight, magnetic, decode scramble, swell.",
      )}
    >
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Type modes">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn(
              "rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-wide uppercase transition-colors",
              mode === m
                ? "border-accent bg-accent text-accent-fg"
                : "border-border-color text-ink-dim hover:text-ink",
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="min-h-50 rounded-2xl border border-border-color bg-elevated p-8 md:p-12"
      >
        <p className="font-display text-section-title font-medium text-ink">
          {chars.map((ch, i) => (
            <span
              key={i}
              ref={(el) => {
                charRefs.current[i] = el;
              }}
              className="inline-block origin-center will-change-transform"
              style={ch === " " ? { whiteSpace: "pre" } : undefined}
            >
              {ch}
            </span>
          ))}
        </p>
        {(reducedMotion || !finePointer) && (
          <p className="mt-4 font-mono text-xs text-ink-faint">
            Fine pointer + motion required for live interaction.
          </p>
        )}
      </div>
    </div>
  );
}
