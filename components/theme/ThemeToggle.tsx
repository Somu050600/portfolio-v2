"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

const subscribeNoop = () => () => {};

const SLANT_WIPE_KEYFRAMES = {
  clipPath: [
    "polygon(0% 0%, 0% 0%, -40% 100%, -40% 100%)", // slanted sliver, left
    "polygon(0% 0%, 140% 0%, 100% 100%, -40% 100%)", // covers, diagonal edge
  ],
};

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes mounted pattern: theme is unknown on the server, so don't
  // render a theme-dependent icon until after hydration. useSyncExternalStore
  // returns false for the server snapshot and true once hydrated.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const toggleTheme = async () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!document.startViewTransition || reducedMotion) {
      setTheme(next);
      return;
    }

    const transition = document.startViewTransition(() => {
      // The theme flip must be committed to the DOM synchronously so the
      // view transition captures the correct "new" snapshot.
      flushSync(() => setTheme(next));
    });

    await transition.ready;
    document.documentElement.animate(SLANT_WIPE_KEYFRAMES, {
      duration: 600,
      easing: "cubic-bezier(.7,0,.3,1)",
      pseudoElement: "::view-transition-new(root)",
    });
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/10"
    >
      {/* Invisible until mounted to avoid a hydration flash of the wrong icon */}
      <span className={mounted ? "contents" : "invisible"}>
        {mounted && resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
