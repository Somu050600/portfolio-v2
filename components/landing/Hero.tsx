"use client";

import { landingConfig } from "@/lib/landing.config";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePageTransition } from "@/lib/page-transition-context";
import { useRouter } from "next/navigation";
import SpotlightTitle from "./SpotlightTitle";
import {
  LANDING_POINTER_EVENT,
  type LandingPointerDetail,
  useMediaQuery,
} from "./use-media-query";

/**
 * Professional landing hero: concise positioning, product-focused proof points,
 * and one primary interaction leading into the work index.
 */
export default function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const interactive = finePointer && !reducedMotion;

  const { hero, interaction } = landingConfig;
  const cover = usePageTransition();
  const router = useRouter();

  useEffect(() => {
    router.prefetch(hero.skipTarget);
  }, [router, hero.skipTarget]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const t = e.target as HTMLElement | null;
      if (t && t.closest("a, button, input, textarea, select")) return;
      e.preventDefault();
      cover({ href: hero.skipTarget, originEl: ctaRef.current });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cover, hero.skipTarget]);

  useEffect(() => {
    if (!interactive) return;
    const root = rootRef.current;
    if (!root) return;

    const shoves = Array.from(
      root.querySelectorAll<HTMLElement>("[data-shove]"),
    );
    const parallax = Array.from(
      root.querySelectorAll<HTMLElement>("[data-parallax]"),
    );
    if (shoves.length === 0 && parallax.length === 0) return;

    const { shoveRadius, shoveStrength, shoveLerp, parallaxMax } = interaction;

    type Vec = { x: number; y: number };
    const targets = new WeakMap<HTMLElement, Vec>();
    const currents = new WeakMap<HTMLElement, Vec>();
    shoves.forEach((el) => {
      targets.set(el, { x: 0, y: 0 });
      currents.set(el, { x: 0, y: 0 });
    });

    let mx = -9999;
    let my = -9999;
    let rafId = 0;

    const onPointer = (e: Event) => {
      const { x, y } = (e as CustomEvent<LandingPointerDetail>).detail;
      mx = x;
      my = y;
    };

    const tick = () => {
      for (const el of shoves) {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.hypot(dx, dy) || 1;
        const t = targets.get(el)!;
        if (dist < shoveRadius) {
          const force = (1 - dist / shoveRadius) ** 1.4;
          t.x = (dx / dist) * force * shoveStrength;
          t.y = (dy / dist) * force * shoveStrength;
        } else {
          t.x = 0;
          t.y = 0;
        }
        const c = currents.get(el)!;
        c.x += (t.x - c.x) * shoveLerp;
        c.y += (t.y - c.y) * shoveLerp;
        el.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0)`;
      }

      const cx0 = window.innerWidth / 2;
      const cy0 = window.innerHeight / 2;
      const ox = (mx - cx0) / cx0;
      const oy = (my - cy0) / cy0;
      for (const el of parallax) {
        const depth = Number(el.dataset.parallax ?? "1");
        const px = ox * parallaxMax * depth;
        const py = oy * parallaxMax * depth;
        el.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!rafId) {
        rafId = requestAnimationFrame(tick);
      }
    };

    window.addEventListener(LANDING_POINTER_EVENT, onPointer);
    document.addEventListener("visibilitychange", onVisibilityChange);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener(LANDING_POINTER_EVENT, onPointer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [interactive, interaction]);

  return (
    <div
      ref={rootRef}
      className="landing-hero relative z-20 flex min-h-dvh flex-col select-none"
    >
      <div className="landing-hero__inner">
        <div data-parallax="0.2" className="will-change-transform">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60 md:text-xs">
            {hero.eyebrow}
          </p>
        </div>

        <div data-parallax="0.35" className="mt-5 will-change-transform">
          <SpotlightTitle
            text={hero.title.join(" ")}
            className="landing-hero__title font-sans text-[clamp(2.65rem,7vw,6.8rem)] font-medium leading-[0.98] tracking-[-0.045em] text-white"
          />
        </div>

        <div data-parallax="0.16" className="landing-hero__meta mt-7 max-w-3xl will-change-transform">
          <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] md:text-xs">
            {hero.quote.map((word, index) => (
              <span key={`${word.text}-${index}`}>
                <span
                  data-shove
                  className={word.emphasis ? "text-[var(--scene-green)]" : ""}
                >
                  {word.text}
                </span>
                {index < hero.quote.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <button
            ref={ctaRef}
            type="button"
            onClick={(e) =>
              cover({
                href: hero.skipTarget,
                originPoint:
                  e.detail > 0 ? { x: e.clientX, y: e.clientY } : undefined,
                originEl: ctaRef.current,
              })
            }
            className="landing-hero__cta group inline-flex items-center gap-3 rounded-lg px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-[background-color,border-color,transform] hover:-translate-y-0.5"
          >
            {hero.ctaLabel}
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            >
              ↗
            </span>
          </button>

          {hero.showSkip && (
            <Link
              href={hero.skipTarget}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55 transition-colors hover:text-white"
            >
              {hero.skipLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
