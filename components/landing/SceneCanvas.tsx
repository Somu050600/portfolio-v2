"use client";

import { useEffect, useRef } from "react";
import { landingConfig, type StarLayer } from "@/lib/landing.config";
import {
  LANDING_POINTER_EVENT,
  type LandingPointerDetail,
} from "./use-media-query";

// ---------------------------------------------------------------------------
// Seeded PRNG — identical to the one used in the DOM Starfield so star
// placement is stable and deterministic (matches any SSR snapshot if needed).
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Star = {
  /** 0–100 % within layer space (matching the original CSS coordinate system) */
  x: number;
  y: number;
  r: number;
  baseOpacity: number;
  twinkleSpeed: number; // rad/s
  twinklePhase: number; // rad
};

type ShootingStar = {
  x: number;
  y: number;
  vx: number; // px/s
  vy: number;
  life: number; // ms remaining
  maxLife: number;
  angle: number;
  shape: string;
};

type Sparkle = {
  x: number;
  y: number;
  vx: number; // px/s
  vy: number;
  life: number; // ms remaining
  maxLife: number;
  r: number;
};

// ---------------------------------------------------------------------------
// Star generation — same algorithm as the removed DOM Starfield
// ---------------------------------------------------------------------------
function buildStars(layer: StarLayer): Star[] {
  const rand = mulberry32(layer.seed);
  const cellSize = 100 / layer.grid;
  const stars: Star[] = [];

  for (let row = 0; row < layer.grid; row++) {
    for (let col = 0; col < layer.grid; col++) {
      const cx = (col + 0.5) * cellSize - 50;
      const cy = (row + 0.5) * cellSize - 50;
      if (Math.sqrt(cx * cx + cy * cy) > layer.maxRadius) continue;
      if (rand() < layer.skipChance) {
        rand(); rand(); rand(); rand();
        continue;
      }
      stars.push({
        x: col * cellSize + (rand() * 1.6 - 0.3) * cellSize,
        y: row * cellSize + (rand() * 1.6 - 0.3) * cellSize,
        r: rand() < layer.size[0] ? layer.size[1] : layer.size[2],
        baseOpacity: layer.opacity[0] + rand() * (layer.opacity[1] - layer.opacity[0]),
        twinkleSpeed: 0.25 + rand() * 0.55,
        twinklePhase: rand() * Math.PI * 2,
      });
    }
  }
  return stars;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Build star layers once — O(n) at mount, nothing per frame.
    const layers = landingConfig.scenery.starfield.layers.map((cfg) => ({
      cfg,
      stars: buildStars(cfg),
      angle: 0,
    }));

    const shooters: ShootingStar[] = [];
    const sparkles: Sparkle[] = [];

    // Pointer (smoothed coords from LandingCursor broadcast).
    let px = -9999;
    let py = -9999;

    // ---------------------------------------------------------------------------
    // Resize: keep canvas pixel dimensions in sync with layout size.
    // ---------------------------------------------------------------------------
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ---------------------------------------------------------------------------
    // Shooting star spawn loop.
    // ---------------------------------------------------------------------------
    const timers: ReturnType<typeof setTimeout>[] = [];

    const spawnShooter = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (shooters.length === 0) {
        const { shapes } = landingConfig.scenery.shootingStars;
        const sx = W * (0.55 + Math.random() * 0.4);
        const sy = H * (Math.random() * 0.55);
        const totalDx = -(W * (0.5 + Math.random() * 0.3));
        const totalDy = H * (0.3 + Math.random() * 0.35);
        const durMs = (1.2 + Math.random() * 0.8) * 1000;
        shooters.push({
          x: sx, y: sy,
          vx: (totalDx / durMs) * 1000,
          vy: (totalDy / durMs) * 1000,
          life: durMs, maxLife: durMs,
          angle: Math.atan2(totalDy, totalDx),
          shape: shapes[Math.floor(Math.random() * shapes.length)],
        });
      }
      const { minDelayMs, maxDelayMs } = landingConfig.scenery.shootingStars;
      timers.push(
        setTimeout(spawnShooter, minDelayMs + Math.random() * (maxDelayMs - minDelayMs)),
      );
    };

    if (!reducedMotion) {
      timers.push(
        setTimeout(spawnShooter, landingConfig.scenery.shootingStars.firstDelayMs),
      );
    }

    // ---------------------------------------------------------------------------
    // Click → sparkle burst.
    // ---------------------------------------------------------------------------
    const onClickSparkle = (e: MouseEvent) => {
      if (reducedMotion) return;
      const { countMin, countMax, speedMin, speedMax, lifeMin, lifeMax, rMin, rMax } =
        landingConfig.scenery.sparkles;
      const count = countMin + Math.floor(Math.random() * (countMax - countMin + 1));
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
        const speed = speedMin + Math.random() * (speedMax - speedMin);
        const maxLife = lifeMin + Math.random() * (lifeMax - lifeMin);
        sparkles.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: maxLife, maxLife,
          r: rMin + Math.random() * (rMax - rMin),
        });
      }
    };
    window.addEventListener("click", onClickSparkle);

    // ---------------------------------------------------------------------------
    // Pointer broadcast subscription (smoothed coords from LandingCursor).
    // ---------------------------------------------------------------------------
    const onPointer = (e: Event) => {
      const { x, y } = (e as CustomEvent<LandingPointerDetail>).detail;
      px = x; py = y;
    };
    window.addEventListener(LANDING_POINTER_EVENT, onPointer);

    // ---------------------------------------------------------------------------
    // rAF draw loop.
    // ---------------------------------------------------------------------------
    let rafId = 0;
    let lastTime = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1); // seconds, capped at 100ms
      lastTime = now;

      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;

      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      // vmax equivalent: largest dimension × 1.4 so the layer covers all corners.
      const layerSize = 1.4 * Math.max(W, H);

      // -----------------------------------------------------------------------
      // Stars — 3 rotating layers.
      // -----------------------------------------------------------------------
      // Parallax depths per layer index (far → near: subtle → more).
      const parallaxDepths = [0.008, 0.015, 0.025];

      for (let li = 0; li < layers.length; li++) {
        const { cfg, stars } = layers[li];

        // Update rotation angle (skip when reduced motion).
        if (!reducedMotion) {
          const dAngle = (2 * Math.PI * dt) / cfg.rotationS;
          layers[li].angle += cfg.reverse ? -dAngle : dAngle;
        }

        // Parallax offset: shift layer based on pointer position.
        const depth = parallaxDepths[li] ?? 0.01;
        const offX = px === -9999 ? 0 : (px - cx) * depth;
        const offY = py === -9999 ? 0 : (py - cy) * depth;

        ctx.save();
        ctx.translate(cx + offX, cy + offY);
        ctx.rotate(layers[li].angle);

        for (const star of stars) {
          const sx = ((star.x / 100) - 0.5) * layerSize;
          const sy = ((star.y / 100) - 0.5) * layerSize;

          let op = star.baseOpacity;
          if (!reducedMotion) {
            op *= 0.7 + 0.3 * Math.sin(now * 0.001 * star.twinkleSpeed + star.twinklePhase);
          }

          ctx.beginPath();
          ctx.arc(sx, sy, star.r / 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${op.toFixed(3)})`;
          ctx.fill();
        }

        ctx.restore();
      }

      // -----------------------------------------------------------------------
      // Shooting stars.
      // -----------------------------------------------------------------------
      ctx.font = '13px "Source Code Pro", ui-monospace, monospace';
      ctx.textBaseline = "middle";

      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.life -= dt * 1000;
        if (s.life <= 0) { shooters.splice(i, 1); continue; }
        s.x += s.vx * dt;
        s.y += s.vy * dt;

        const progress = 1 - s.life / s.maxLife; // 0 → 1 as it travels
        let alpha: number;
        if (progress < 0.08) alpha = progress / 0.08;
        else if (progress > 0.9) alpha = (1 - progress) / 0.1;
        else alpha = 1;
        alpha *= 0.85;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.shadowColor = "rgba(255,255,255,0.5)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fillText(s.shape, 0, 0);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // -----------------------------------------------------------------------
      // Sparkles.
      // -----------------------------------------------------------------------
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const p = sparkles[i];
        p.life -= dt * 1000;
        if (p.life <= 0) { sparkles.splice(i, 1); continue; }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 120 * dt; // gentle gravity in px/s²

        const alpha = (p.life / p.maxLife) ** 0.6; // ease-out fade

        ctx.save();
        ctx.shadowColor = "rgba(255,255,255,0.6)";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    // Pause loop when tab is hidden; resume cleanly on return.
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!rafId) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
      ro.disconnect();
      window.removeEventListener("click", onClickSparkle);
      window.removeEventListener(LANDING_POINTER_EVENT, onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 size-full"
    />
  );
}
