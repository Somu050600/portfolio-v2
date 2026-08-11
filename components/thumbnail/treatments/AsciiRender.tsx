"use client";

import { useEffect, useRef } from "react";
import { ACCENTS } from "@/lib/theme.config";
import type { TreatmentProps } from "../registry";

const RAIN_CHARS = "{}[]()<>:=\",./-+|*#01?!";
const PIPELINE = ["{ data }", "→", "<html>", "→", "[pdf]"];
const CHAR_SIZE = 9;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Drop = { y: number; speed: number; chars: string[] };

function drawFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentColor: string,
  drops: Drop[],
  rainProg: number,
) {
  const cs = CHAR_SIZE;
  const cols = Math.floor(width / cs);
  const rows = Math.floor(height / cs);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#121316";
  ctx.fillRect(0, 0, width, height);

  ctx.font = `${cs}px "JetBrains Mono",ui-monospace,monospace`;
  ctx.textBaseline = "top";

  const ar = parseInt(accentColor.slice(1, 3), 16);
  const ag = parseInt(accentColor.slice(3, 5), 16);
  const ab = parseInt(accentColor.slice(5, 7), 16);

  for (let ci = 0; ci < cols; ci++) {
    const drop = drops[ci];
    if (!drop) continue;
    for (let ri = 0; ri < rows; ri++) {
      const char = drop.chars[ri % drop.chars.length];
      const dy = drop.y - ri;

      let rainAlpha = 0;
      if (dy >= 0 && dy < 1) rainAlpha = 0.9;
      else if (dy >= 1 && dy < 4) rainAlpha = 0.55 * (1 - (dy - 1) / 3);

      const dimAlpha = 0.1 - rainProg * 0.07;
      if (dimAlpha > 0.005) {
        ctx.fillStyle = `rgba(180,185,210,${dimAlpha.toFixed(3)})`;
        ctx.fillText(char, ci * cs, ri * cs);
      }
      if (rainAlpha * rainProg > 0.01) {
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${(rainAlpha * rainProg).toFixed(3)})`;
        if (dy < 1) { ctx.shadowColor = accentColor; ctx.shadowBlur = 6; }
        ctx.fillText(char, ci * cs, ri * cs);
        ctx.shadowBlur = 0;
      }
    }
  }

  ctx.font = `${Math.round(cs * 0.8)}px "JetBrains Mono",ui-monospace,monospace`;
  ctx.textBaseline = "bottom";
  ctx.fillStyle = `rgba(140,145,170,${(0.3 + rainProg * 0.2).toFixed(3)})`;
  ctx.fillText("ASCII  RENDER", cs, height - cs * 0.5);
}

export default function AsciiRender({ active, width, height, accent }: TreatmentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const rafRef = useRef(0);

  // Shared mutable state in refs so both effects can access it.
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const dropsRef = useRef<Drop[]>([]);
  const accentColorRef = useRef(ACCENTS[accent ?? "blue"].dark);
  const rainProgRef = useRef(0);
  const lastTimeRef = useRef(0);
  const widthRef = useRef(width);
  const heightRef = useRef(height);

  // Keep activeRef in sync. No side-effects, just a ref write.
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Canvas setup + static draw + mutation ticker (no rAF, no polling).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctxRef.current = ctx;
    widthRef.current = width;
    heightRef.current = height;

    const color = ACCENTS[accent ?? "blue"].dark;
    accentColorRef.current = color;

    const rand = mulberry32(31337);
    const maxCols = Math.ceil(width / CHAR_SIZE) + 4;
    const maxRows = Math.ceil(height / CHAR_SIZE) + 8;
    dropsRef.current = Array.from({ length: maxCols }, () => ({
      y: rand() * maxRows,
      speed: 4 + rand() * 8,
      chars: Array.from(
        { length: maxRows + 8 },
        () => RAIN_CHARS[Math.floor(rand() * RAIN_CHARS.length)],
      ),
    }));

    drawFrame(ctx, width, height, color, dropsRef.current, 0);

    // Mutate one char every ~800ms so grid feels slightly alive at rest.
    // No rAF, just a slow interval that does a single canvas redraw.
    const mutateInterval = setInterval(() => {
      if (activeRef.current) return; // rAF loop handles this while hovering
      const drops = dropsRef.current;
      const col = Math.floor(Math.random() * drops.length);
      const row = Math.floor(Math.random() * maxRows);
      const drop = drops[col];
      if (drop) drop.chars[row] = RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)];
      drawFrame(ctx, width, height, color, drops, 0);
    }, 800);

    return () => {
      clearInterval(mutateInterval);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [width, height, accent]);

  // Start rAF loop when active; loop self-terminates when back at rest.
  // No setInterval polling: React drives the start, rAF drives the frames.
  useEffect(() => {
    if (!active) return;
    if (rafRef.current) return; // already running

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const ctx = ctxRef.current;
      const w = widthRef.current;
      const h = heightRef.current;
      if (!ctx || w === 0 || h === 0) { rafRef.current = 0; return; }

      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      rainProgRef.current +=
        ((activeRef.current ? 1 : 0) - rainProgRef.current) * Math.min(dt * 5, 1);

      const rows = Math.floor(h / CHAR_SIZE);
      const cols = Math.floor(w / CHAR_SIZE);
      const drops = dropsRef.current;
      for (let ci = 0; ci < cols; ci++) {
        const drop = drops[ci];
        if (drop) {
          drop.y += drop.speed * dt * rainProgRef.current;
          if (drop.y > rows + 6) drop.y = -4;
        }
      }

      drawFrame(ctx, w, h, accentColorRef.current, drops, rainProgRef.current);

      // Self-terminate once settled back to rest.
      if (!activeRef.current && rainProgRef.current < 0.01) {
        rafRef.current = 0;
        drawFrame(ctx, w, h, accentColorRef.current, drops, 0);
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [active]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 size-full"
        style={{
          width,
          height,
          transform: active ? "scale(1)" : "scale(1.45)",
          transformOrigin: "center center",
          transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center gap-2 font-mono text-[10px] pointer-events-none select-none"
      >
        {PIPELINE.map((label, i) =>
          label === "→" ? (
            <span key={i} className="text-[11px] text-white/30">{label}</span>
          ) : (
            <span key={i} className="text-white/75">{label}</span>
          )
        )}
      </div>
    </>
  );
}
