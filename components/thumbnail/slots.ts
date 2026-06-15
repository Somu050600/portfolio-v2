const MAX = 3;
const live = new Set<string>();

/** Try to acquire one of the global live-treatment slots. */
export function claimSlot(id: string): boolean {
  if (live.has(id)) return true;
  if (live.size >= MAX) return false;
  live.add(id);
  return true;
}

export function releaseSlot(id: string): void {
  live.delete(id);
}
