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
  preview?: string;
};

export const DEFAULT_PIXEL_CHARACTER: PixelCharacterId = "frog";

export const PIXEL_CHARACTERS: readonly PixelCharacterDefinition[] = [
  {
    id: "dog",
    name: "Tiny Dog",
    preview: "/pixel-characters/previews/dog.png",
  },
  {
    id: "sparrow",
    name: "Sparrow",
    preview: "/pixel-characters/previews/sparrow.png",
  },
  {
    id: "cat",
    name: "Black Cat",
    preview: "/pixel-characters/previews/cat.png",
  },
  {
    id: "penguin",
    name: "Penguin",
    preview: "/pixel-characters/previews/penguin.png",
  },
  {
    id: "frog",
    name: "Frog",
    preview: "/pixel-characters/previews/frog.png",
  },
  { id: "current", name: "Current Pixel" },
];

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
