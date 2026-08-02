import type { HomeNavKey } from "@/lib/home.config";

export const PIXEL_STORAGE_KEY = "pixel.v1";

export type PixelMemory = {
  visits: number;
  pokes: number;
  last: number;
};

export type PixelSpeechKind = "greeting" | "nav" | "scroll" | "poke";
export type PixelMood =
  | "curious"
  | "wary"
  | "annoyed"
  | "resigned"
  | "payoff"
  | "loop";

export type PixelTone = "body" | "punch" | "muted" | "accent";

export type PixelPokeReaction = {
  text: string;
  mood: PixelMood;
  eyeOpacity: number;
  tone: PixelTone;
};

export const EMPTY_PIXEL_MEMORY: PixelMemory = {
  visits: 0,
  pokes: 0,
  last: 0,
};

export const PIXEL_SPEECH_PRIORITY: Record<PixelSpeechKind, number> = {
  greeting: 0,
  nav: 1,
  scroll: 2,
  poke: 3,
};

export function canPixelSpeechReplace(
  incoming: PixelSpeechKind,
  active: PixelSpeechKind,
) {
  return PIXEL_SPEECH_PRIORITY[incoming] >= PIXEL_SPEECH_PRIORITY[active];
}

export const PIXEL_NAV_LINES: Record<HomeNavKey, string> = {
  work: "the good stuff",
  experience: "he's been busy",
  about: "he's shy",
  playground: "my house",
};

export const PIXEL_SCROLL_LINES = [
  { threshold: 0.25, text: "keep going" },
  { threshold: 0.5, text: "halfway" },
  { threshold: 0.75, text: "almost there" },
  { threshold: 0.99, text: "that's everything. email him" },
] as const;

const POKE_LINES = [
  "hi there",
  "oh — hello again",
  "i'm Pixel",
  "how are you?",
  "that tickles",
  "why are you poking me",
  "still poking",
  "is this fun for you?",
  "really?",
  "i have work to do",
  "somu — come get him",
  "...",
  "fine. poke away",
  "that's fourteen",
  "you win. i am tired",
  "ok — you clearly need something",
  "email him. he likes persistent people",
] as const;

const LOOP_LINES = [
  "we good?",
  "still here?",
  "go read a case study",
  "i live here, you do not",
] as const;

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

export function readPixelMemory(raw: string | null): PixelMemory {
  if (!raw) return { ...EMPTY_PIXEL_MEMORY };

  try {
    const value = JSON.parse(raw) as Partial<PixelMemory>;
    if (
      !isNonNegativeInteger(value.visits) ||
      !isNonNegativeInteger(value.pokes) ||
      !isNonNegativeInteger(value.last)
    ) {
      return { ...EMPTY_PIXEL_MEMORY };
    }

    return {
      visits: value.visits,
      pokes: value.pokes,
      last: value.last,
    };
  } catch {
    return { ...EMPTY_PIXEL_MEMORY };
  }
}

export function writePixelMemory(memory: PixelMemory) {
  try {
    window.localStorage.setItem(PIXEL_STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // Storage may be unavailable in private browsing; Pixel remains ephemeral.
  }
}

export function getPokeReaction(
  sessionPokes: number,
  lifetimePokes: number,
  returning: boolean,
): PixelPokeReaction {
  let text: string;

  if (sessionPokes === 1 && returning) {
    text = lifetimePokes > 20 ? "not this again" : "oh. you are back";
  } else if (sessionPokes <= POKE_LINES.length) {
    text = POKE_LINES[Math.max(0, sessionPokes - 1)];
  } else {
    text = LOOP_LINES[(sessionPokes - 18) % LOOP_LINES.length];
  }

  if (sessionPokes <= 5) {
    return { text, mood: "curious", eyeOpacity: 1, tone: "body" };
  }
  if (sessionPokes <= 8) {
    return { text, mood: "wary", eyeOpacity: 0.8, tone: "body" };
  }
  if (sessionPokes <= 12) {
    return { text, mood: "annoyed", eyeOpacity: 0.45, tone: "punch" };
  }
  if (sessionPokes <= 15) {
    return { text, mood: "resigned", eyeOpacity: 0.28, tone: "muted" };
  }
  if (sessionPokes <= 17) {
    return { text, mood: "payoff", eyeOpacity: 1, tone: "accent" };
  }
  return { text, mood: "loop", eyeOpacity: 1, tone: "body" };
}

export function getReturnGreeting(memory: PixelMemory, now: number) {
  if (now - memory.last > 7 * 86_400_000) return "thought you left";
  if (memory.pokes >= 16) return "oh good. the poker";
  if (memory.pokes >= 5) return "you again";
  return "welcome back";
}

export function selectScrollThreshold(
  progress: number,
  spent: ReadonlySet<number>,
) {
  return (
    PIXEL_SCROLL_LINES.find(
      ({ threshold }) => progress >= threshold && !spent.has(threshold),
    ) ?? null
  );
}
