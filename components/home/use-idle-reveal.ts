"use client";

import {
  DISCOVERY_HOLD_MS,
  DISCOVERY_IDLE_MS,
  hasSeenHint,
  markHintSeen,
  shouldRevealHint,
  type DiscoveryHintId,
} from "@/lib/discovery-hints";
import { useEffect, useRef, useState, type RefObject } from "react";

const ACTIVITY_EVENTS = [
  "pointerdown",
  "keydown",
  "wheel",
  "touchstart",
] as const;

type IdleRevealOptions = {
  id: DiscoveryHintId;
  /** The element the hint points at. It must be on screen for the hint to fire. */
  subjectRef: RefObject<Element | null>;
  idleMs?: number;
  holdMs?: number;
};

/**
 * Reveals a one-shot hint after the visitor has been still for a while, then
 * gets out of the way at the first sign of intent.
 *
 * Everything the listeners touch lives in refs, so the effect runs once per
 * mount: re-running it on the visibility change would tear down the very timer
 * that retires the hint.
 */
export function useIdleReveal({
  id,
  subjectRef,
  idleMs = DISCOVERY_IDLE_MS,
  holdMs = DISCOVERY_HOLD_MS,
}: IdleRevealOptions): boolean {
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  // Once retired, nothing re-arms the hint for the life of the page.
  const settledRef = useRef(false);

  useEffect(() => {
    const subject = subjectRef.current;
    if (!subject || settledRef.current || hasSeenHint(id)) return;

    let inView = false;
    let idleTimer = 0;
    let holdTimer = 0;

    const settle = () => {
      settledRef.current = true;
      window.clearTimeout(idleTimer);
      window.clearTimeout(holdTimer);
      visibleRef.current = false;
      setVisible(false);
    };

    const reveal = () => {
      if (settledRef.current || visibleRef.current) return;
      if (
        !shouldRevealHint({
          seen: hasSeenHint(id),
          inView,
          // Never two nudges at once, and never over an open overlay.
          busy:
            document.querySelector(
              "[data-discovery-hint], [data-mobile-menu], [role=dialog]",
            ) !== null,
        })
      ) {
        return;
      }

      // Seen on sight: a hint the visitor ignored still counts as spent.
      markHintSeen(id);
      visibleRef.current = true;
      setVisible(true);
      holdTimer = window.setTimeout(settle, holdMs);
    };

    const arm = () => {
      if (settledRef.current || visibleRef.current) return;
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(reveal, idleMs);
    };

    const onActivity = () => {
      if (visibleRef.current) {
        settle();
        return;
      }
      arm();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? false;
        if (inView) arm();
        else window.clearTimeout(idleTimer);
      },
      { threshold: 0.35 },
    );
    observer.observe(subject);

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true });
    }

    return () => {
      observer.disconnect();
      window.clearTimeout(idleTimer);
      window.clearTimeout(holdTimer);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity);
      }
    };
  }, [holdMs, id, idleMs, subjectRef]);

  return visible;
}
