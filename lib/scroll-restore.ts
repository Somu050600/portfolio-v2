// Scroll restoration for back-navigation. The grid page remounts on every nav
// (scroll resets to 0), which breaks the reverse card↔case-study morph: the
// target card ends up below the fold when the View Transition snapshots the
// new page. We save the grid's scroll on the way in and restore it — before
// the snapshot — on the way back, so the card is on-screen for the morph.

type LenisLike = {
  scrollTo: (target: number, opts?: { immediate?: boolean }) => void;
};

let lenis: LenisLike | null = null;
export const setLenisInstance = (instance: LenisLike | null) => {
  lenis = instance;
};

const positions: Record<string, number> = {};
export const saveScroll = (key: string, y: number) => {
  positions[key] = y;
};

// One-shot flag: a restore happened this navigation, so the scroll reset that
// normally runs on transition-complete should be skipped (it would yank the
// page back to the top, undoing the restore).
let restorePending = false;

export function restoreScroll(key: string) {
  const y = positions[key];
  if (y == null) return;
  // Set the document scroll synchronously so the VT snapshot captures the
  // restored position, then sync Lenis so it doesn't animate away afterward.
  window.scrollTo(0, y);
  lenis?.scrollTo(y, { immediate: true });
  restorePending = true;
}

export function consumeRestorePending() {
  const v = restorePending;
  restorePending = false;
  return v;
}

/** Shared key for the home/work grid (one grid, reused across visits). */
export const GRID_SCROLL_KEY = "home-grid";
