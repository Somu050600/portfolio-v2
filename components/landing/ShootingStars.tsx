"use client";

import { useEffect, useRef } from "react";
import { landingConfig } from "@/lib/landing.config";
import { useMediaQuery } from "./use-media-query";

/**
 * Periodic ASCII shooting stars. Each star is a span with a single CSS
 * animation (`shoot` keyframe in globals.css) translating it diagonally and
 * fading it. Spawning is randomized at runtime — client-only, after mount,
 * so there's no SSR hydration concern.
 */
export default function ShootingStars() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (reducedMotion) return;
    const stage = stageRef.current;
    if (!stage) return;

    const { firstDelayMs, minDelayMs, maxDelayMs, shapes } =
      landingConfig.scenery.shootingStars;
    const timers: number[] = [];

    const spawn = () => {
      const el = document.createElement("span");
      el.className = "shooting-star";
      el.textContent = shapes[Math.floor(Math.random() * shapes.length)];

      // Start somewhere upper-right, travel toward lower-left so the
      // trail leans in a consistent direction.
      const w = window.innerWidth;
      const h = window.innerHeight;
      const startX = w * (0.55 + Math.random() * 0.4);
      const startY = h * (Math.random() * 0.55);
      const dx = -(w * (0.5 + Math.random() * 0.3));
      const dy = h * (0.3 + Math.random() * 0.35);
      const duration = 1.2 + Math.random() * 0.8;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      el.style.left = `${startX}px`;
      el.style.top = `${startY}px`;
      el.style.setProperty("--shoot-dx", `${dx}px`);
      el.style.setProperty("--shoot-dy", `${dy}px`);
      el.style.setProperty("--shoot-duration", `${duration}s`);
      el.style.setProperty("--shoot-angle", `${angle}deg`);

      stage.appendChild(el);
      timers.push(window.setTimeout(() => el.remove(), duration * 1000 + 200));
    };

    const loop = () => {
      // At most one star at a time so the sky stays quiet in between.
      if (stage.childElementCount === 0) spawn();
      const delay = minDelayMs + Math.random() * (maxDelayMs - minDelayMs);
      timers.push(window.setTimeout(loop, delay));
    };

    timers.push(window.setTimeout(spawn, firstDelayMs));
    timers.push(window.setTimeout(loop, firstDelayMs + 2700));

    return () => {
      timers.forEach(clearTimeout);
      stage.replaceChildren();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    />
  );
}
