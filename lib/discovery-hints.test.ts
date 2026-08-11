import { beforeEach, describe, expect, test } from "bun:test";
import {
  DISCOVERY_HINTS_STORAGE_KEY,
  hasSeenHint,
  markHintSeen,
  readSeenHints,
  shouldRevealHint,
} from "./discovery-hints";

function fakeStorage(initial?: string) {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set(DISCOVERY_HINTS_STORAGE_KEY, initial);
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    read: () => values.get(DISCOVERY_HINTS_STORAGE_KEY),
  };
}

describe("discovery hint memory", () => {
  let store: ReturnType<typeof fakeStorage>;

  beforeEach(() => {
    store = fakeStorage();
  });

  test("remembers each hint once, in one shared entry", () => {
    markHintSeen("portrait-accent", store);
    markHintSeen("portrait-accent", store);
    markHintSeen("pixel-poke", store);

    expect(readSeenHints(store)).toEqual(["portrait-accent", "pixel-poke"]);
    expect(hasSeenHint("portrait-accent", store)).toBe(true);
    expect(hasSeenHint("pixel-poke", store)).toBe(true);
  });

  test("treats a corrupt or absent entry as nothing seen", () => {
    expect(readSeenHints(fakeStorage())).toEqual([]);
    expect(readSeenHints(fakeStorage("not json"))).toEqual([]);
    expect(readSeenHints(fakeStorage('{"portrait-accent":true}'))).toEqual([]);
    expect(hasSeenHint("portrait-accent", null)).toBe(false);
  });

  test("survives storage that refuses to write", () => {
    const blocked = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota exceeded");
      },
    };

    expect(() => markHintSeen("portrait-accent", blocked)).not.toThrow();
  });
});

describe("reveal conditions", () => {
  test("fires only for an unseen hint whose subject is on screen", () => {
    expect(shouldRevealHint({ seen: false, inView: true })).toBe(true);
    expect(shouldRevealHint({ seen: true, inView: true })).toBe(false);
    expect(shouldRevealHint({ seen: false, inView: false })).toBe(false);
  });

  test("stays quiet while an overlay owns the screen", () => {
    expect(shouldRevealHint({ seen: false, inView: true, busy: true })).toBe(
      false,
    );
  });
});
