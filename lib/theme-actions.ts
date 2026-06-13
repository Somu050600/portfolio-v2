"use client";

import { flushSync } from "react-dom";
import { useTheme } from "next-themes";

const SLANT_WIPE_KEYFRAMES = {
  clipPath: [
    "polygon(0% 0%, 0% 0%, -40% 100%, -40% 100%)",
    "polygon(0% 0%, 140% 0%, 100% 100%, -40% 100%)",
  ],
};

export function useThemeToggleAction() {
  const { resolvedTheme, setTheme } = useTheme();

  return async () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!document.startViewTransition || reducedMotion) {
      setTheme(next);
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });

    await transition.ready;
    document.documentElement.animate(SLANT_WIPE_KEYFRAMES, {
      duration: 600,
      easing: "cubic-bezier(.7,0,.3,1)",
      pseudoElement: "::view-transition-new(root)",
    });
  };
}

export function openThemeCustomizer() {
  window.dispatchEvent(new CustomEvent("theme:open-customizer"));
}
