"use client";

import { landingConfig } from "@/lib/landing.config";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePageTransition } from "@/lib/page-transition-context";
import { useRouter } from "next/navigation";
import {
  LANDING_POINTER_EVENT,
  type LandingPointerDetail,
  useMediaQuery,
} from "./use-media-query";

/**
 * Centered welcome hero: mono eyebrow → serif display title → EXPLORE CTA →
 * skip link → quote line.
 *
 * Interaction (fine pointers only): every [data-shove] word is pushed away
 * from the cursor within a radius and springs back (lerped); [data-parallax]
 * blocks drift by a fraction of the pointer offset from viewport center.
 * Both read the single LandingCursor pointer broadcast in one rAF loop,
 * paused on visibilitychange.
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

  // Prefetch /home so it's ready before the transition cover completes.
  useEffect(() => {
    router.prefetch(hero.skipTarget);
  }, [router, hero.skipTarget]);

  // Enter key triggers the same flow as clicking the CTA.
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

  // Cursor shove + parallax, one rAF loop off the single pointer source.
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
      const ox = (mx - cx0) / cx0; // -1 .. 1
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
      className="relative z-20 flex min-h-dvh flex-col items-center justify-center gap-2 px-6 text-center"
    >
      {/* Eyebrow: mono caps, wide tracking, dim */}
      <div data-parallax="0" className="will-change-transform">
        <p className="font-mono text-xxs md:text-xs lg:text-base uppercase text-white/45">
          {hero.eyebrow}
        </p>
      </div>

      {/* Title: Glass Antiqua display serif */}
      <div data-parallax="0" className="will-change-transform">
        <h1 className="font-serif text-5xl tracking-wide leading-none text-white gap-1 flex flex-row">
          {hero.title.map((word) => (
            <span
              key={word}
              data-shove
              className="inline-block will-change-transform"
            >
              {word}{" "}
            </span>
          ))}
        </h1>
      </div>

      {/* CTA + skip */}
      <div className="my-6 flex flex-col items-center gap-3">
        <button
          ref={ctaRef}
          type="button"
          onClick={() => cover({ href: hero.skipTarget, originEl: ctaRef.current })}
          className="group inline-flex items-center gap-3 bg-[#F3F1EB] text-[#0C0C10] rounded-xl  px-3 py-1.5 font-mono text-xs sm:text-sm uppercase tracking-wide transition-colors hover:scale-105"
        >
          {hero.ctaLabel}
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1 text-xs"
          >
            →
          </span>
        </button>

        {hero.showSkip && (
          <Link
            href={hero.skipTarget}
            className="font-mono text-xs uppercase tracking-wide text-white/25 transition-colors hover:text-white/55"
          >
            {hero.skipLabel}
          </Link>
        )}
      </div>

      {/* Quote: mono uppercase tracked, like Megan's — emphasis words brighter */}
      <div data-parallax="0" className="mt-4 max-w-md will-change-transform">
        <p className="font-mono text-xxs md:text-xs lg:text-base uppercase leading-relaxed text-white/30">
          {hero.quote.map((w, i) => (
            <span key={i}>
              <span
                data-shove
                className={`inline-block will-change-transform ${
                  w.emphasis ? "text-white/80" : ""
                }`}
              >
                {w.text}
              </span>
              {i < hero.quote.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
