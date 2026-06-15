// lib/morph.ts
// Shared-element morph plumbing for the card ↔ case-study View Transition.
// Names are applied transiently (just-in-time, then cleared) so they never
// collide across the many grid cards or interfere with other transitions.

export const MORPH_NAMES = {
  frame: "cs-frame",
  title: "cs-title",
  no: "cs-no",
  thumb: "cs-thumb",
} as const;

const SLOTS = ["title", "no", "thumb"] as const;

/**
 * Tag `root` as the morph frame (`cs-frame`) and its `[data-morph="…"]`
 * descendants with their matching names. Also neutralizes any rotate tilt on
 * the root so the frame morphs to a square box (restored by clearEl).
 */
export function tagEl(root: HTMLElement | null) {
  if (!root) return;
  root.style.viewTransitionName = MORPH_NAMES.frame;
  root.dataset.morphPrevTransform = root.style.transform;
  root.style.transform = "none";
  for (const slot of SLOTS) {
    const el = root.querySelector<HTMLElement>(`[data-morph="${slot}"]`);
    if (el) el.style.viewTransitionName = MORPH_NAMES[slot];
  }
}

/** Remove names + restore the transform that tagEl saved. */
export function clearEl(root: HTMLElement | null) {
  if (!root) return;
  root.style.viewTransitionName = "";
  if (root.dataset.morphPrevTransform !== undefined) {
    root.style.transform = root.dataset.morphPrevTransform;
    delete root.dataset.morphPrevTransform;
  }
  for (const slot of SLOTS) {
    const el = root.querySelector<HTMLElement>(`[data-morph="${slot}"]`);
    if (el) el.style.viewTransitionName = "";
  }
}

// One-shot store: a forward morph is in flight (set by a card, read by the
// case-study page on arrival).
let morphPending: "forward" | null = null;
export const setMorphPending = (v: "forward" | null) => {
  morphPending = v;
};
export const getMorphPending = () => morphPending;

// One-shot store: which card slug a back-navigation should reverse-morph into.
let backMorphSlug: string | null = null;
export const setBackMorphSlug = (slug: string | null) => {
  backMorphSlug = slug;
};
export const getBackMorphSlug = () => backMorphSlug;
