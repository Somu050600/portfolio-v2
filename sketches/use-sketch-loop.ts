"use client";

import { useEffect, useRef } from "react";

const MAX_DPR = 1.5;
const TARGET_FPS = 36;
const FRAME_MS = 1000 / TARGET_FPS;

export type SketchProps = {
  active: boolean;
  paused: boolean;
  className?: string;
  interactive?: boolean;
};

export function useThrottledLoop(
  active: boolean,
  paused: boolean,
  draw: (dt: number) => void,
) {
  const drawRef = useRef(draw);

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    if (!active || paused) return;

    let raf = 0;
    let last = 0;
    let acc = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;

      const dt = last ? Math.min(48, now - last) : FRAME_MS;
      last = now;
      acc += dt;

      if (acc >= FRAME_MS) {
        drawRef.current(acc / 1000);
        acc = 0;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, paused]);
}

export function useCanvasSize(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement ?? canvas);
    return () => ro.disconnect();
  }, [active, canvasRef]);
}
