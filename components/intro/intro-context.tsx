"use client";

import { createContext, useContext } from "react";

/**
 * covered   – overlay is on screen, site hidden beneath it
 * revealing – overlay is sliding up, hero can start its stagger
 * done      – overlay is gone (or was skipped), site fully interactive
 */
export type IntroPhase = "covered" | "revealing" | "done";

export const IntroContext = createContext<IntroPhase>("done");

export function useIntroPhase(): IntroPhase {
  return useContext(IntroContext);
}
