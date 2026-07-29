"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  DEFAULT_SPOTLIGHT_STATE,
  clampSpotlightTarget,
  getQuadrantOpacities,
  getSpotlightSize,
  interpolateSpotlight,
  isSpotlightSettled,
  type SpotlightState,
} from "./landing-interactions";
import { useMediaQuery } from "./use-media-query";

type UseSpotlightTrackingOptions = {
  rootRef: RefObject<HTMLElement | null>;
  motionDisabled: boolean;
  activeLine: number | null;
  anchoredLine: number | null;
  ctaActive: boolean;
  transitioning: boolean;
};

function writeVisualState(root: HTMLElement, state: SpotlightState) {
  root.style.setProperty("--spot-x", `${(state.x * 100).toFixed(3)}%`);
  root.style.setProperty("--spot-y", `${(state.y * 100).toFixed(3)}%`);
  root.style.setProperty("--spot-size", `${state.size.toFixed(1)}px`);
  root.style.setProperty(
    "--frame-x",
    `${((state.x - 0.57) * -14).toFixed(2)}px`,
  );
  root.style.setProperty(
    "--frame-y",
    `${((state.y - 0.44) * -10).toFixed(2)}px`,
  );

  getQuadrantOpacities(state.x, state.y).forEach((opacity, index) => {
    root.style.setProperty(`--quadrant-${index + 1}`, opacity.toFixed(3));
  });
}

export function useSpotlightTracking({
  rootRef,
  motionDisabled,
  activeLine,
  anchoredLine,
  ctaActive,
  transitioning,
}: UseSpotlightTrackingOptions) {
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const currentStateRef = useRef<SpotlightState>({
    ...DEFAULT_SPOTLIGHT_STATE,
  });
  const targetStateRef = useRef<SpotlightState>({
    ...DEFAULT_SPOTLIGHT_STATE,
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const enabled = finePointer && !motionDisabled;
    let rootRect = root.getBoundingClientRect();
    let current: SpotlightState = { ...currentStateRef.current };
    let target: SpotlightState = { ...targetStateRef.current };
    let rafId = 0;
    let visible = !document.hidden;

    const stopLoop = () => {
      if (!rafId) return;
      cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const tick = () => {
      current = interpolateSpotlight(current, target);

      if (isSpotlightSettled(current, target)) {
        current = { ...target };
        writeVisualState(root, current);
        rafId = 0;
        return;
      }

      writeVisualState(root, current);
      rafId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (visible && enabled && !rafId) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const elementTarget = (selector: string) => {
      const element = root.querySelector<HTMLElement>(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return clampSpotlightTarget(
        (rect.left + rect.width / 2 - rootRect.left) / rootRect.width,
        (rect.top + rect.height / 2 - rootRect.top) / rootRect.height,
      );
    };

    const retargetControls = () => {
      rootRect = root.getBoundingClientRect();

      let anchoredTarget: { x: number; y: number } | null = null;
      if (ctaActive || transitioning) {
        anchoredTarget = elementTarget("[data-landing-cta]");
      } else if (anchoredLine) {
        anchoredTarget = elementTarget(
          `[data-headline-line="${anchoredLine}"]`,
        );
      }

      if (anchoredTarget) {
        target.x = anchoredTarget.x;
        target.y = anchoredTarget.y;
      }

      target.size = getSpotlightSize({
        y: target.y,
        lineActive: Boolean(activeLine || anchoredLine),
        ctaActive,
        transitioning,
      });

      if (anchoredLine) {
        root.style.setProperty(
          "--frame-lock-y",
          `${((target.y - 0.5) * rootRect.height).toFixed(2)}px`,
        );
      } else {
        root.style.setProperty("--frame-lock-y", "0px");
      }

      startLoop();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!enabled || anchoredLine || ctaActive || transitioning) return;

      const normalized = clampSpotlightTarget(
        (event.clientX - rootRect.left) / rootRect.width,
        (event.clientY - rootRect.top) / rootRect.height,
      );
      target = {
        ...normalized,
        size: getSpotlightSize({
          y: normalized.y,
          lineActive: Boolean(activeLine),
        }),
      };
      startLoop();
    };

    const onPointerLeave = () => {
      target = { ...DEFAULT_SPOTLIGHT_STATE };
      root.style.setProperty("--frame-lock-y", "0px");
      startLoop();
    };

    const onResize = () => {
      rootRect = root.getBoundingClientRect();
      retargetControls();
    };

    const onVisibilityChange = () => {
      visible = !document.hidden;
      if (!visible) {
        stopLoop();
      } else if (!isSpotlightSettled(current, target)) {
        startLoop();
      }
    };

    if (!enabled) {
      stopLoop();
      const fixedState = {
        x: finePointer ? DEFAULT_SPOTLIGHT_STATE.x : 0.5,
        y: finePointer ? DEFAULT_SPOTLIGHT_STATE.y : 0.44,
        size: Math.min(340, window.innerWidth * 0.82),
      };
      current = fixedState;
      target = fixedState;
      writeVisualState(root, fixedState);
      root.style.setProperty("--frame-lock-y", "0px");
      root.dataset.spotlightTracking = "fixed";
    } else {
      root.dataset.spotlightTracking = "pointer";
      writeVisualState(root, current);
      retargetControls();
    }

    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopLoop();
      currentStateRef.current = current;
      targetStateRef.current = target;
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      delete root.dataset.spotlightTracking;
    };
  }, [
    rootRef,
    finePointer,
    motionDisabled,
    activeLine,
    anchoredLine,
    ctaActive,
    transitioning,
  ]);
}
