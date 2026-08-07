"use client";

import { useEffect, useRef } from "react";
import {
  PIXEL_NAV_LINES,
  PIXEL_STORAGE_KEY,
  canPixelSpeechReplace,
  getPokeReaction,
  getReturnGreeting,
  readPixelMemory,
  selectScrollThreshold,
  writePixelMemory,
  type PixelSpeechKind,
  type PixelTone,
} from "./pixel-pet";

const PET_WIDTH = 62;
const FRAME_MS = 1000 / 60;
const POKE_SUPPRESSION_MS = 3_200;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function counterLabel(label: "VISIT" | "POKES", count: number) {
  return `${label} ${String(count).padStart(2, "0")}`;
}

export default function PixelPet() {
  const cardRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLSpanElement>(null);
  const rightEyeRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLParagraphElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const track = trackRef.current;
    const pet = petRef.current;
    const body = bodyRef.current;
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;
    const bubble = bubbleRef.current;
    const counter = counterRef.current;
    const progress = progressRef.current;

    if (
      !card ||
      !track ||
      !pet ||
      !body ||
      !leftEye ||
      !rightEye ||
      !bubble ||
      !counter ||
      !progress
    ) {
      return;
    }

    const reducedQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let reducedMotion = reducedQuery.matches;
    let frameId = 0;
    let lastFrame = performance.now();
    let x = 0;
    let direction = 1;
    let maxX = 0;
    let trackRect = track.getBoundingClientRect();
    let cursorX = trackRect.left + trackRect.width / 2;
    let cursorY = trackRect.top + trackRect.height / 2;
    let lastPointerMove = performance.now();
    let squash = 0;
    let lean = 0;
    let lastScrollY = window.scrollY;
    let eyeOpacity = 1;
    let sessionPokes = 0;
    let lastPokeAt = Number.NEGATIVE_INFINITY;
    let returning = false;
    let visitCount = 1;
    let memory = readPixelMemory(null);
    let activeSpeech: PixelSpeechKind | null = null;
    let activeUntil = 0;
    let hideBubbleTimer = 0;
    let pokeResetTimer = 0;
    let greetingTimer = 0;
    const navTimers = new Map<Element, number>();
    const spentThresholds = new Set<number>();

    const measure = () => {
      trackRect = track.getBoundingClientRect();
      maxX = Math.max(0, trackRect.width - PET_WIDTH);
      x = clamp(x, 0, maxX);
    };

    const clearPendingSpeech = () => {
      window.clearTimeout(greetingTimer);
      greetingTimer = 0;
      navTimers.forEach((timer) => window.clearTimeout(timer));
      navTimers.clear();
    };

    const hideBubble = () => {
      bubble.style.opacity = "0";
      bubble.style.transform = "translateY(2px)";
      activeSpeech = null;
      activeUntil = 0;
    };

    const say = (
      kind: PixelSpeechKind,
      text: string,
      holdMs: number,
      tone: PixelTone = "body",
    ) => {
      const now = performance.now();
      if (kind !== "poke" && now - lastPokeAt < POKE_SUPPRESSION_MS) {
        return false;
      }
      if (
        activeSpeech &&
        now < activeUntil &&
        !canPixelSpeechReplace(kind, activeSpeech)
      ) {
        return false;
      }

      clearPendingSpeech();
      window.clearTimeout(hideBubbleTimer);
      bubble.textContent = text;
      bubble.dataset.tone = tone;
      bubble.style.opacity = "1";
      bubble.style.transform = "translateY(0)";
      activeSpeech = kind;
      activeUntil = now + holdMs;
      hideBubbleTimer = window.setTimeout(hideBubble, holdMs);
      return true;
    };

    const updateProgress = (allowSpeech: boolean) => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const depth = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;
      progress.style.transform = `scaleX(${depth})`;

      if (
        !allowSpeech ||
        document.documentElement.scrollHeight < window.innerHeight * 1.6
      ) {
        return;
      }

      const next = selectScrollThreshold(depth, spentThresholds);
      if (next && say("scroll", next.text, 2_400)) {
        spentThresholds.add(next.threshold);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
      lastPointerMove = performance.now();
    };

    const onScroll = () => {
      const nextScrollY = window.scrollY;
      lean = clamp((nextScrollY - lastScrollY) / 48, -1, 1);
      lastScrollY = nextScrollY;
      updateProgress(true);
    };

    const onPoke = () => {
      sessionPokes += 1;
      memory = { ...memory, pokes: memory.pokes + 1, last: Date.now() };
      writePixelMemory(memory);
      counter.textContent = counterLabel("POKES", sessionPokes);
      lastPokeAt = performance.now();
      squash = 1;

      const reaction = getPokeReaction(
        sessionPokes,
        memory.pokes,
        returning,
      );
      eyeOpacity = reaction.eyeOpacity;
      say("poke", reaction.text, 2_900, reaction.tone);

      window.clearTimeout(pokeResetTimer);
      pokeResetTimer = window.setTimeout(() => {
        sessionPokes = 0;
        eyeOpacity = 1;
        counter.textContent = counterLabel("VISIT", visitCount);
      }, 45_000);
    };

    const navItems = Array.from(
      document.querySelectorAll<HTMLElement>("[data-pixel-nav]"),
    );
    const navListeners = navItems.map((item) => {
      const onEnter = () => {
        const existing = navTimers.get(item);
        if (existing) window.clearTimeout(existing);
        const timer = window.setTimeout(() => {
          navTimers.delete(item);
          const key = item.dataset.pixelNav;
          const line = key ? PIXEL_NAV_LINES[key as keyof typeof PIXEL_NAV_LINES] : null;
          if (line) say("nav", line, 2_200);
        }, 340);
        navTimers.set(item, timer);
      };
      const onLeave = () => {
        const timer = navTimers.get(item);
        if (timer) window.clearTimeout(timer);
        navTimers.delete(item);
      };
      item.addEventListener("pointerenter", onEnter);
      item.addEventListener("pointerleave", onLeave);
      return { item, onEnter, onLeave };
    });

    const frame = (now: number) => {
      const delta = clamp((now - lastFrame) / FRAME_MS, 0, 2);
      lastFrame = now;
      const talking = activeSpeech !== null && now < activeUntil;

      if (!reducedMotion) {
        if (!talking) {
          x += direction * 0.34 * (1 + Math.abs(lean) * 2.2) * delta;
          if (x >= maxX) {
            x = maxX;
            direction = -1;
          } else if (x <= 0) {
            x = 0;
            direction = 1;
          }
        }
        squash = Math.max(0, squash - 0.055 * delta);
        lean *= Math.pow(0.9, delta);
      } else {
        squash = 0;
        lean = 0;
      }

      const bob = reducedMotion ? 0 : -1.25 + Math.cos(now / 732) * 1.25;
      const scaleX = 1 + 0.13 * squash;
      const scaleY = 1 - 0.2 * squash;
      const rotation = reducedMotion ? 0 : lean * -7 * direction;
      pet.style.transform = `translate3d(${x}px, ${bob}px, 0)`;
      body.style.transform = `rotate(${rotation}deg) scaleX(${direction}) scale(${scaleX}, ${scaleY})`;

      const petLeft = trackRect.left + x;
      const petTop = trackRect.bottom - 46 + bob;
      const sleeping = now - lastPointerMove >= 4_000;
      const eyeY = petTop + 46 - 22 + 4;
      const navLift = activeSpeech === "nav" && talking ? -2.6 : 0;

      [
        [leftEye, petLeft + 19 + 3],
        [rightEye, petLeft + 37 + 3],
      ].forEach(([eye, eyeX]) => {
        const element = eye as HTMLSpanElement;
        const dx = cursorX - Number(eyeX);
        const dy = cursorY - eyeY;
        const distance = Math.hypot(dx, dy) || 1;
        const travel = Math.min(2, distance / 26);
        const cursorOffsetX = (dx / distance) * travel;
        const cursorOffsetY = (dy / distance) * travel;
        const walkLead = direction * 1.3;
        element.style.opacity = String(eyeOpacity);
        element.style.transform = sleeping
          ? `translate(${walkLead}px, ${navLift}px) scaleY(.13)`
          : `translate(${cursorOffsetX + walkLead}px, ${cursorOffsetY + navLift}px)`;
      });

      if (bubble.style.opacity !== "0") {
        const bubbleWidth = bubble.offsetWidth;
        const bubbleX = clamp(
          x + PET_WIDTH / 2 - bubbleWidth / 2,
          0,
          Math.max(0, trackRect.width - bubbleWidth),
        );
        bubble.style.left = `${bubbleX}px`;
      }

      frameId = window.requestAnimationFrame(frame);
    };

    const startLoop = () => {
      if (frameId || document.hidden) return;
      lastFrame = performance.now();
      frameId = window.requestAnimationFrame(frame);
    };

    const stopLoop = () => {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const onVisibilityChange = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    const onReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);
    measure();
    updateProgress(false);

    try {
      const stored = readPixelMemory(
        window.localStorage.getItem(PIXEL_STORAGE_KEY),
      );
      returning = stored.visits > 0;
      const previousLast = stored.last;
      const now = Date.now();
      memory = { ...stored, visits: stored.visits + 1, last: now };
      visitCount = memory.visits;
      writePixelMemory(memory);
      counter.textContent = counterLabel("VISIT", visitCount);

      if (returning) {
        greetingTimer = window.setTimeout(() => {
          say(
            "greeting",
            getReturnGreeting({ ...stored, last: previousLast }, Date.now()),
            3_200,
          );
        }, 2_000);
      }
    } catch {
      counter.textContent = counterLabel("VISIT", 1);
    }

    card.addEventListener("click", onPoke);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedQuery.addEventListener("change", onReducedMotionChange);
    startLoop();

    return () => {
      stopLoop();
      clearPendingSpeech();
      window.clearTimeout(hideBubbleTimer);
      window.clearTimeout(pokeResetTimer);
      resizeObserver.disconnect();
      card.removeEventListener("click", onPoke);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedQuery.removeEventListener("change", onReducedMotionChange);
      navListeners.forEach(({ item, onEnter, onLeave }) => {
        item.removeEventListener("pointerenter", onEnter);
        item.removeEventListener("pointerleave", onLeave);
      });
    };
  }, []);

  return (
    <div
      ref={cardRef}
      data-pixel-card
      aria-hidden="true"
      className="hidden h-38 cursor-pointer flex-col gap-2.5 overflow-hidden rounded-[10px] border border-border-color bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_82%,transparent),color-mix(in_srgb,var(--accent)_4.5%,var(--bg)))] p-3.25 shadow-sm select-none lg:flex"
    >
      <div className="flex items-center justify-between gap-3 font-mono text-metadata leading-none font-semibold tracking-[0.16em] text-ink-faint uppercase tabular-nums">
        <span>Pixel</span>
        <span ref={counterRef}>VISIT 01</span>
      </div>

      <div
        ref={trackRef}
        data-pixel-track
        className="relative min-h-0 flex-1"
      >
        <p
          ref={bubbleRef}
          data-pixel-bubble
          data-tone="body"
          className="absolute bottom-13 box-border w-max max-w-full rounded-[7px] border border-border-color bg-surface px-2 py-1.25 font-mono text-metadata leading-[1.35] font-normal whitespace-normal text-ink-dim opacity-0 shadow-sm transition-[opacity,transform] duration-150 data-[tone=accent]:border-accent data-[tone=accent]:text-accent data-[tone=muted]:text-ink-faint data-[tone=punch]:text-accent"
        />

        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-border-color"
        />
        <span
          ref={progressRef}
          data-pixel-progress
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent"
        />

        <div
          ref={petRef}
          data-pixel-pet
          className="absolute bottom-px left-0 h-11.5 w-15.5 will-change-transform"
        >
          <div
            ref={bodyRef}
            data-pixel-body
            className="absolute bottom-0 left-0 h-11 w-15.5 origin-bottom overflow-hidden rounded-[21px_21px_13px_13px] border border-thumb-border bg-[linear-gradient(170deg,color-mix(in_srgb,var(--thumb-bg)_78%,white),var(--thumb-bg))] shadow-md will-change-transform"
          >
            <span
              ref={leftEyeRef}
              className="absolute bottom-5.5 left-4.75 h-2 w-1.5 rounded-[3px] bg-accent transition-transform duration-180 ease-out will-change-transform"
            />
            <span
              ref={rightEyeRef}
              className="absolute bottom-5.5 left-9.25 h-2 w-1.5 rounded-[3px] bg-accent transition-transform duration-180 ease-out will-change-transform"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
