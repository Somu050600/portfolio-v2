// components/casestudy/CaseStudyMorph.tsx
"use client";

import { useContext, useEffect, useLayoutEffect } from "react";
import {
  clearEl,
  getMorphPending,
  setBackMorphSlug,
  setMorphPending,
  tagEl,
} from "@/lib/morph";
import { PageTransitionContext } from "@/lib/page-transition-context";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Renders nothing. Two jobs:
 *  1. Register this page's slug so a back-navigation knows which grid card to
 *     reverse-morph into.
 *  2. On a forward morph arrival, tag this page's elements (the live DOM under
 *     [data-cs-main]) before the overlay resolves the navigation and the
 *     browser snapshots the new page; clear them when the transition finishes.
 */
export default function CaseStudyMorph({ slug }: { slug: string }) {
  const { subscribeTransitionComplete } = useContext(PageTransitionContext);

  useEffect(() => {
    setBackMorphSlug(slug);
  }, [slug]);

  useIsoLayoutEffect(() => {
    if (getMorphPending() !== "forward") return;
    setMorphPending(null);
    const main = document.querySelector<HTMLElement>("[data-cs-main]");
    tagEl(main);
    const unsub = subscribeTransitionComplete(() => {
      clearEl(main);
      unsub();
    });
    return () => unsub();
  }, [subscribeTransitionComplete]);

  return null;
}
