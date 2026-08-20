"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  DISCOVERY_IDLE_MS,
  hasSeenHint,
  markHintSeen,
  shouldRevealHint,
} from "@/lib/discovery-hints";
import {
  PIXEL_HINT_EXTRA_DELAY_MS,
  PIXEL_HINT_HOLD_MS,
  PIXEL_HINT_LINE,
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
import { PixelCharacterStage } from "./PixelCharacter";
import { CharacterPicker } from "./PixelCharacterPicker";
import {
  DEFAULT_PIXEL_CHARACTER,
  DOG_TAIL_WAG_DURATION_MS,
  PIXEL_CHARACTER_STORAGE_KEY,
  advanceGaitPhase,
  getLocalEyeTranslationX,
  getTailWagDelay,
  getTailWagRotation,
  getTwoLegPose,
  readPixelCharacterSelection,
  writePixelCharacterSelection,
  type PixelCharacterId,
} from "./pixel-characters";

const PET_WIDTH = 62;
/** Signs of intent, as opposed to a cursor drifting across the page. */
const HINT_INTENT_EVENTS = [
  "pointerdown",
  "keydown",
  "wheel",
  "touchstart",
] as const;
const FRAME_MS = 1000 / 60;
const POKE_SUPPRESSION_MS = 3_200;

function subscribeToStoredCharacter(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === PIXEL_CHARACTER_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

function getStoredCharacterSnapshot() {
  try {
    return readPixelCharacterSelection(window.localStorage);
  } catch {
    return DEFAULT_PIXEL_CHARACTER;
  }
}

function getServerCharacterSnapshot() {
  return DEFAULT_PIXEL_CHARACTER;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function counterLabel(label: "VISIT" | "POKES", count: number) {
  return `${label} ${String(count).padStart(2, "0")}`;
}

export default function PixelPet() {
  const persistedCharacter = useSyncExternalStore(
    subscribeToStoredCharacter,
    getStoredCharacterSnapshot,
    getServerCharacterSnapshot,
  );
  const [sessionCharacter, setSessionCharacter] =
    useState<PixelCharacterId | null>(null);
  const selectedCharacter = sessionCharacter ?? persistedCharacter;
  const [pickerOpen, setPickerOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLSpanElement>(null);
  const rightEyeRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLParagraphElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  const selectCharacter = (character: PixelCharacterId) => {
    setSessionCharacter(character);
    try {
      writePixelCharacterSelection(window.localStorage, character);
    } catch {
      // The selection remains active for this page when storage is unavailable.
    }
  };

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
    let gaitPhase = 0;
    let tailWagStartedAt: number | null = null;
    let nextTailWagAt = lastFrame + getTailWagDelay(Math.random());
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
      delete bubble.dataset.discoveryHint;
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

    const onPoke = (event: MouseEvent) => {
      if ((event.target as Element).closest("[data-pixel-picker]")) return;

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

      retireHint();

      window.clearTimeout(pokeResetTimer);
      pokeResetTimer = window.setTimeout(() => {
        sessionPokes = 0;
        eyeOpacity = 1;
        counter.textContent = counterLabel("VISIT", visitCount);
      }, 45_000);
    };

    // One-shot discovery nudge. Pixel reacts to clicks and nothing announces
    // that, so after a still moment he asks for one himself. Shared memory with
    // the other hints, so it is spent once per browser.
    let hintTimer = 0;
    let hintInView = false;

    const revealPokeHint = () => {
      // Anyone who has ever poked him has already found the interaction.
      if (memory.pokes > 0 || sessionPokes > 0) return;
      if (
        !shouldRevealHint({
          seen: hasSeenHint("pixel-poke"),
          inView: hintInView,
          // Never two nudges at once, and never over an open overlay.
          busy:
            document.querySelector(
              "[data-discovery-hint], [data-mobile-menu], [role=dialog]",
            ) !== null,
        })
      ) {
        return;
      }

      // Only spend the hint if he actually got to say it: higher-priority
      // speech (a poke, a nav line) can refuse the bubble.
      if (!say("hint", PIXEL_HINT_LINE, PIXEL_HINT_HOLD_MS, "accent")) return;
      bubble.dataset.discoveryHint = "pixel-poke";
      markHintSeen("pixel-poke");
      retireHint();
    };

    /** Spent, or beaten to it by a poke: stop watching for the rest of the visit. */
    const retireHint = () => {
      window.clearTimeout(hintTimer);
      hintObserver.disconnect();
      for (const event of HINT_INTENT_EVENTS) {
        window.removeEventListener(event, onIntent);
      }
    };

    const armHint = () => {
      window.clearTimeout(hintTimer);
      hintTimer = window.setTimeout(
        revealPokeHint,
        DISCOVERY_IDLE_MS + PIXEL_HINT_EXTRA_DELAY_MS,
      );
    };

    const onIntent = () => {
      if (bubble.dataset.discoveryHint) return;
      armHint();
    };

    const hintObserver = new IntersectionObserver(
      ([entry]) => {
        hintInView = entry?.isIntersecting ?? false;
        if (hintInView) armHint();
        else window.clearTimeout(hintTimer);
      },
      { threshold: 0.6 },
    );

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
      const previousX = x;

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

      const travelledPxThisFrame = Math.abs(x - previousX);
      gaitPhase = advanceGaitPhase(gaitPhase, travelledPxThisFrame);

      const bob = reducedMotion ? 0 : -1.25 + Math.cos(now / 732) * 1.25;
      const scaleX = 1 + 0.13 * squash;
      const scaleY = 1 - 0.2 * squash;
      const rotation = reducedMotion ? 0 : lean * -7 * direction;
      pet.style.transform = `translate3d(${x}px, ${bob}px, 0)`;

      const activeCharacter = pet.querySelector<HTMLElement>(
        '[data-pixel-character][data-active="true"]',
      );
      const activeBody = activeCharacter?.querySelector<HTMLElement>(
        "[data-pixel-body]",
      );
      const isCurrentCharacter =
        activeCharacter?.dataset.pixelCharacter === "current";
      const gaitBob =
        reducedMotion || isCurrentCharacter
          ? 0
          : -Math.abs(Math.sin(gaitPhase)) * 2.4;
      const bodyTransform = isCurrentCharacter
        ? `rotate(${rotation}deg) scaleX(${direction}) scale(${scaleX}, ${scaleY})`
        : `translateY(${gaitBob}px) rotate(${rotation}deg) scaleX(${direction}) scale(${scaleX}, ${scaleY})`;

      if (activeBody) activeBody.style.transform = bodyTransform;

      if (!isCurrentCharacter) {
        activeCharacter
          ?.querySelectorAll<SVGPathElement>("[data-pixel-leg]")
          .forEach((leg) => {
            const hip = {
              x: Number(leg.dataset.hipX),
              y: Number(leg.dataset.hipY),
            };
            const legLength = Number(leg.dataset.legLength);
            const gaitSide = leg.dataset.gaitSide === "1" ? 1 : 0;
            const pose = getTwoLegPose({
              phase: gaitPhase,
              side: gaitSide,
              hip,
              legLength,
            });
            leg.setAttribute(
              "d",
              `M ${pose.hip.x} ${pose.hip.y} L ${pose.knee.x} ${pose.knee.y} L ${pose.foot.x} ${pose.foot.y}`,
            );
          });
      }

      const dogTail = activeCharacter?.querySelector<SVGGraphicsElement>(
        '[data-pixel-tail="dog"]',
      );
      if (dogTail) {
        let tailRotation = 0;
        if (!reducedMotion) {
          if (tailWagStartedAt === null && now >= nextTailWagAt) {
            tailWagStartedAt = now;
          }
          if (tailWagStartedAt !== null) {
            const elapsedMs = now - tailWagStartedAt;
            tailRotation = getTailWagRotation(elapsedMs);
            if (elapsedMs >= DOG_TAIL_WAG_DURATION_MS) {
              tailWagStartedAt = null;
              nextTailWagAt = now + getTailWagDelay(Math.random());
              tailRotation = 0;
            }
          }
        }
        dogTail.style.transform = `rotate(${tailRotation}deg)`;
      }

      const petLeft = trackRect.left + x;
      const petTop = trackRect.bottom - 46 + bob;
      const sleeping = now - lastPointerMove >= 4_000;
      const eyeY = petTop + 46 - 22 + 4;
      const navLift = activeSpeech === "nav" && talking ? -2.6 : 0;

      [
        ["left", leftEye, petLeft + 19 + 3],
        ["right", rightEye, petLeft + 37 + 3],
      ].forEach(([side, currentEye, eyeX]) => {
        const dx = cursorX - Number(eyeX);
        const dy = cursorY - eyeY;
        const distance = Math.hypot(dx, dy) || 1;
        const travel = Math.min(2, distance / 26);
        const cursorOffsetX = (dx / distance) * travel;
        const cursorOffsetY = (dy / distance) * travel;
        const localEyeTranslationX = getLocalEyeTranslationX(
          sleeping ? 0 : cursorOffsetX,
          direction,
        );
        const eyeTransform = sleeping
          ? `translate(${localEyeTranslationX}px, ${navLift}px) scaleY(.13)`
          : `translate(${localEyeTranslationX}px, ${cursorOffsetY + navLift}px)`;

        const activeEye = activeCharacter?.querySelector<HTMLElement>(
          `[data-pixel-eye="${side}"]`,
        );
        const eyes = new Set<HTMLElement>([
          currentEye as HTMLSpanElement,
          ...(activeEye ? [activeEye] : []),
        ]);
        eyes.forEach((element) => {
          element.style.opacity = String(eyeOpacity);
          element.style.transform = eyeTransform;
        });
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
      if (reducedMotion) {
        tailWagStartedAt = null;
        nextTailWagAt = performance.now() + getTailWagDelay(Math.random());
      }
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

    if (!hasSeenHint("pixel-poke")) {
      hintObserver.observe(card);
      for (const event of HINT_INTENT_EVENTS) {
        window.addEventListener(event, onIntent, { passive: true });
      }
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
      retireHint();
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
      role="group"
      aria-label="Pixel pet"
      className="relative hidden h-38 cursor-pointer flex-col gap-2.5 rounded-[10px] border border-border-color bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_82%,transparent),color-mix(in_srgb,var(--accent)_4.5%,var(--bg)))] p-3.25 shadow-sm select-none lg:flex"
    >
      <div className="flex items-center justify-between gap-3 font-mono text-metadata leading-none font-semibold tracking-[0.16em] text-ink-faint uppercase tabular-nums">
        <div data-pixel-picker>
          <CharacterPicker
            value={selectedCharacter}
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            onChange={selectCharacter}
          />
        </div>
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
          <PixelCharacterStage
            selected={selectedCharacter}
            currentBodyRef={bodyRef}
            currentLeftEyeRef={leftEyeRef}
            currentRightEyeRef={rightEyeRef}
          />
        </div>
      </div>
    </div>
  );
}
