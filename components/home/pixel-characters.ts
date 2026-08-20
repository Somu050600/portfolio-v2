export type PixelCharacterId =
  | "dog"
  | "sparrow"
  | "cat"
  | "penguin"
  | "frog"
  | "current";

export type PixelCharacterDefinition = {
  id: PixelCharacterId;
  name: string;
};

export const DEFAULT_PIXEL_CHARACTER: PixelCharacterId = "dog";
export const PIXEL_CHARACTER_STORAGE_KEY = "pixel.character.v1";

type PixelCharacterStorage = Pick<Storage, "getItem" | "setItem">;

export const PIXEL_CHARACTERS: readonly PixelCharacterDefinition[] = [
  {
    id: "dog",
    name: "Tiny Dog",
  },
  {
    id: "sparrow",
    name: "Sparrow",
  },
  {
    id: "cat",
    name: "Black Cat",
  },
  {
    id: "penguin",
    name: "Penguin",
  },
  {
    id: "frog",
    name: "Frog",
  },
  { id: "current", name: "Current Pixel" },
];

const PIXEL_CHARACTER_IDS = new Set<PixelCharacterId>(
  PIXEL_CHARACTERS.map(({ id }) => id),
);

export function readPixelCharacterSelection(
  storage: PixelCharacterStorage | null,
): PixelCharacterId {
  if (!storage) return DEFAULT_PIXEL_CHARACTER;

  try {
    const stored = storage.getItem(PIXEL_CHARACTER_STORAGE_KEY);
    return PIXEL_CHARACTER_IDS.has(stored as PixelCharacterId)
      ? (stored as PixelCharacterId)
      : DEFAULT_PIXEL_CHARACTER;
  } catch {
    return DEFAULT_PIXEL_CHARACTER;
  }
}

export function writePixelCharacterSelection(
  storage: PixelCharacterStorage | null,
  value: PixelCharacterId,
) {
  if (!storage) return;

  try {
    storage.setItem(PIXEL_CHARACTER_STORAGE_KEY, value);
  } catch {
    // Storage can be unavailable; the in-page selection still works.
  }
}

export function getNextCharacterMenuIndex(
  currentIndex: number,
  key: string,
  itemCount: number,
) {
  if (itemCount <= 0) return null;
  if (key === "Home") return 0;
  if (key === "End") return itemCount - 1;
  if (key === "ArrowDown") return (currentIndex + 1) % itemCount;
  if (key === "ArrowUp") return (currentIndex - 1 + itemCount) % itemCount;
  return null;
}

export function getLocalEyeTranslationX(
  cursorOffsetX: number,
  direction: number,
) {
  const screenTranslationX = cursorOffsetX + direction * 1.3;
  return screenTranslationX * direction;
}

export function getTailWagDelay(randomValue: number) {
  const normalizedRandom = Math.min(1, Math.max(0, randomValue));
  return 1_400 + normalizedRandom * 3_200;
}

export const DOG_TAIL_WAG_DURATION_MS = 720;

export function getTailWagRotation(elapsedMs: number) {
  if (elapsedMs <= 0 || elapsedMs >= DOG_TAIL_WAG_DURATION_MS) return 0;

  const progress = elapsedMs / DOG_TAIL_WAG_DURATION_MS;
  const envelope = Math.sin(progress * Math.PI);
  return Math.sin(progress * Math.PI * 6) * 18 * envelope;
}

export type Vec2 = { x: number; y: number };

export type LegPose = {
  hip: Vec2;
  knee: Vec2;
  foot: Vec2;
  angleDeg: number;
  swing: number;
  cycle: number;
};

const TAU = Math.PI * 2;
const GAIT_STRIDE_PX = 28;

const mod = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

export function advanceGaitPhase(phase: number, travelledPx: number) {
  return mod(
    phase + (Math.max(0, travelledPx) / GAIT_STRIDE_PX) * TAU,
    TAU,
  );
}

export function getTwoLegPose({
  phase,
  side,
  hip,
  legLength,
  arcDegrees = 90,
  footLift = 2.5,
}: {
  phase: number;
  side: 0 | 1;
  hip: Vec2;
  legLength: number;
  arcDegrees?: number;
  footLift?: number;
}): LegPose {
  const cycle = mod(phase / TAU + (side === 0 ? 0 : 0.5), 1);
  const halfArc = arcDegrees / 2;
  const back = 270 - halfArc;
  const front = 270 + halfArc;

  let angleDeg: number;
  let swing = 0;
  let lift = 0;

  if (cycle < 0.5) {
    const progress = cycle / 0.5;
    angleDeg = front - (front - back) * progress;
  } else {
    const progress = (cycle - 0.5) / 0.5;
    angleDeg = back + (front - back) * progress;
    swing = Math.sin(progress * Math.PI);
    lift = swing * footLift;
  }

  const angle = (angleDeg * Math.PI) / 180;
  const foot = {
    x: hip.x + Math.cos(angle) * legLength,
    y: hip.y - Math.sin(angle) * legLength - lift,
  };
  const dx = foot.x - hip.x;
  const dy = foot.y - hip.y;
  const kneeBend = swing * (1.6 + legLength * 0.12);
  const knee = {
    x: hip.x + dx * 0.48 + kneeBend,
    y: hip.y + dy * 0.46 - lift * 0.12,
  };

  return { hip, knee, foot, angleDeg, swing, cycle };
}
