"use client";

import { useCallback, useRef } from "react";
import {
  useCanvasSize,
  useThrottledLoop,
  type SketchProps,
} from "./use-sketch-loop";

type Blob = { x: number; y: number; vx: number; vy: number; hue: number };

function createBlobs(w: number, h: number, count: number): Blob[] {
  return Array.from({ length: count }, (_, i) => ({
    x: w * (0.25 + (i / count) * 0.5),
    y: h * 0.5,
    vx: 0,
    vy: 0,
    hue: 180 + i * 28,
  }));
}

/** Lightweight dye-field sketch for card previews. */
export default function FluidDyeCard({
  active,
  paused,
  className,
  interactive = true,
}: SketchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<Blob[]>([]);
  const pointerRef = useRef({ x: -999, y: -999, down: false });

  useCanvasSize(canvasRef, active);

  const draw = useCallback(
    (dt: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w < 2 || h < 2) return;

      if (blobsRef.current.length === 0) {
        blobsRef.current = createBlobs(w, h, 5);
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, w, h);
      }

      const ptr = pointerRef.current;
      const blobs = blobsRef.current;

      ctx.fillStyle = "rgba(10, 10, 10, 0.08)";
      ctx.fillRect(0, 0, w, h);

      for (const b of blobs) {
        if (interactive && ptr.x > -100) {
          const dx = ptr.x - b.x;
          const dy = ptr.y - b.y;
          const dist = Math.hypot(dx, dy) + 1;
          const force = ptr.down ? 220 : 90;
          b.vx += (dx / dist) * force * dt;
          b.vy += (dy / dist) * force * dt;
        }
        b.vx *= 0.92;
        b.vy *= 0.92;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < 0 || b.x > w) b.vx *= -0.6;
        if (b.y < 0 || b.y > h) b.vy *= -0.6;
        b.x = Math.max(0, Math.min(w, b.x));
        b.y = Math.max(0, Math.min(h, b.y));

        const r = Math.min(w, h) * 0.22;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
        g.addColorStop(0, `hsla(${b.hue}, 85%, 62%, 0.55)`);
        g.addColorStop(1, `hsla(${b.hue}, 85%, 42%, 0)`);
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    },
    [interactive],
  );

  useThrottledLoop(active, paused, draw);

  const onPointer = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      down: e.buttons > 0,
    };
  };

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      onPointerMove={interactive ? onPointer : undefined}
      onPointerDown={interactive ? onPointer : undefined}
      onPointerUp={interactive ? onPointer : undefined}
      onPointerLeave={() => {
        pointerRef.current = { x: -999, y: -999, down: false };
      }}
    />
  );
}
