"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccentProvider } from "./AccentProvider";
import type { ReactNode } from "react";

/**
 * Root theme provider. Composes:
 *   1. next-themes  — persists & applies mode (light / dark / system) via
 *                     `class` attribute on <html>. First-visit default: light.
 *   2. AccentProvider — owns per-mode accent selection, live preview, commit.
 *   3. TooltipProvider — required by shadcn Tooltip components.
 *
 * Drop-in replacement for the bare next-themes ThemeProvider in app/layout.tsx.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
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
