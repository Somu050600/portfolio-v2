const MAX_LIVE = 2;
const live = new Set<string>();

/** Try to acquire one of the ≤2 global live-canvas slots. */
export function tryAcquireCanvasSlot(id: string): boolean {
  if (live.has(id)) return true;
  if (live.size >= MAX_LIVE) return false;
  live.add(id);
  return true;
}

export function releaseCanvasSlot(id: string): void {
  live.delete(id);
}

export function hasWebGL2(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}
