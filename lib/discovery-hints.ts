/**
 * One-shot discovery hints: the small nudges that point at things nobody would
 * otherwise find (the portrait's shirt following the accent, poking Pixel).
 *
 * Each hint fires at most once per browser. The seen ids share a single
 * localStorage entry so a new hint costs an id, not a key.
 */

export const DISCOVERY_HINTS_STORAGE_KEY = "discovery-hints.v1";

export type DiscoveryHintId = "portrait-accent" | "pixel-poke";

/** Idle time before a hint appears. Long enough to read as a pause, not a lag. */
export const DISCOVERY_IDLE_MS = 4_000;
/** How long it stays if the visitor never touches anything. */
export const DISCOVERY_HOLD_MS = 10_000;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function resolveStorage(storage?: StorageLike | null): StorageLike | null {
  if (storage !== undefined) return storage;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    // Storage can throw outright when cookies are blocked.
    return null;
  }
}

export function readSeenHints(storage?: StorageLike | null): DiscoveryHintId[] {
  const store = resolveStorage(storage);
  if (!store) return [];

  try {
    const raw = store.getItem(DISCOVERY_HINTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is DiscoveryHintId => typeof id === "string");
  } catch {
    // Corrupt or unreadable value: treat as nothing seen, never throw at paint.
    return [];
  }
}

export function markHintSeen(
  id: DiscoveryHintId,
  storage?: StorageLike | null,
): void {
  const store = resolveStorage(storage);
  if (!store) return;

  const seen = readSeenHints(store);
  if (seen.includes(id)) return;

  try {
    store.setItem(DISCOVERY_HINTS_STORAGE_KEY, JSON.stringify([...seen, id]));
  } catch {
    // Private mode / quota. The hint simply shows again next visit.
  }
}

export function hasSeenHint(
  id: DiscoveryHintId,
  storage?: StorageLike | null,
): boolean {
  return readSeenHints(storage).includes(id);
}

export type RevealConditions = {
  seen: boolean;
  /** The thing being pointed at is on screen. */
  inView: boolean;
  /** Something already has the visitor's attention (an open menu, a dialog). */
  busy?: boolean;
};

/**
 * A hint earns its interruption only when it is new, its subject is visible,
 * and nothing else is competing for attention.
 */
export function shouldRevealHint({
  seen,
  inView,
  busy = false,
}: RevealConditions): boolean {
  return !seen && inView && !busy;
}
