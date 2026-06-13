"use client";

import { useCallback, useRef } from "react";
import {
  useCanvasSize,
  useThrottledLoop,
  type SketchProps,
} from "./use-sketch-loop";

type Blob = { x: number; y: number; vx: number; vy: number; hue: number; r: number };

/** Full-screen fluid dye playground sketch. */
export default function FluidSimFull({
  active,
  paused,
  className,
}: SketchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<Blob[]>([]);
  const pointerRef = useRef({ x: -999, y: -999, down: false });

  useCanvasSize(canvasRef, active);

  const draw = useCallback((dt: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w < 2 || h < 2) return;

    if (blobsRef.current.length === 0) {
      blobsRef.current = Array.from({ length: 12 }, (_, i) => ({
        x: w * Math.random(),
        y: h * Math.random(),
        vx: 0,
        vy: 0,
        hue: 160 + i * 14,
        r: Math.min(w, h) * (0.08 + Math.random() * 0.06),
      }));
    }

    const ptr = pointerRef.current;
    const blobs = blobsRef.current;

    ctx.fillStyle = "rgba(10, 10, 10, 0.06)";
    ctx.fillRect(0, 0, w, h);

    for (const b of blobs) {
      if (ptr.x > -100) {
        const dx = ptr.x - b.x;
        const dy = ptr.y - b.y;
        const dist = Math.hypot(dx, dy) + 1;
        const force = ptr.down ? 480 : 160;
        b.vx += (dx / dist) * force * dt;
        b.vy += (dy / dist) * force * dt;
      }
      b.vx *= 0.9;
      b.vy *= 0.9;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.x < -b.r) b.x = w + b.r;
      if (b.x > w + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = h + b.r;
      if (b.y > h + b.r) b.y = -b.r;

      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, `hsla(${b.hue}, 90%, 65%, 0.65)`);
      g.addColorStop(0.5, `hsla(${b.hue + 20}, 85%, 50%, 0.25)`);
      g.addColorStop(1, `hsla(${b.hue}, 80%, 40%, 0)`);
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }, []);

  useThrottledLoop(active, paused, draw);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-label="Fluid simulation — drag to inject dye"
      onPointerMove={(e) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        pointerRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          down: e.buttons > 0,
        };
      }}
      onPointerDown={(e) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        pointerRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          down: true,
        };
      }}
      onPointerUp={() => {
        pointerRef.current.down = false;
      }}
      onPointerLeave={() => {
        pointerRef.current = { x: -999, y: -999, down: false };
      }}
    />
  );
}
