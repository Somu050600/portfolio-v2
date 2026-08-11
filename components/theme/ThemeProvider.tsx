"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { THEME_DEFAULTS } from "@/lib/theme.config";
import { AccentProvider } from "./AccentProvider";
import type { ReactNode } from "react";

/**
 * Root theme provider. Composes:
 *   1. next-themes  persists & applies mode (light / dark / system) via
 *                     `class` attribute on <html>. First-visit default: dark.
 *   2. AccentProvider owns per-mode accent selection, live preview, commit.
 *   3. TooltipProvider is required by shadcn Tooltip components.
 *
 * Drop-in replacement for the bare next-themes ThemeProvider in app/layout.tsx.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={THEME_DEFAULTS.mode}
      enableSystem
      disableTransitionOnChange
    >
      <AccentProvider>
        <TooltipProvider delay={300}>
          {children}
        </TooltipProvider>
      </AccentProvider>
    </NextThemesProvider>
  );
}
