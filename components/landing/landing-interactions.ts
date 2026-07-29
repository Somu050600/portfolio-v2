export type SpotlightState = {
  x: number;
  y: number;
  size: number;
};

export type TemperaturePreset = "warm" | "neutral" | "cool";

type MeasurableElement = {
  getBoundingClientRect: () => {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

const DEFAULT_SPOTLIGHT = { x: 0.57, y: 0.45, size: 340 } as const;
const POSITION_LERP = 0.055;
const SIZE_LERP = 0.07;
const POSITION_EPSILON = 0.0005;
const SIZE_EPSILON = 0.4;
const DEVELOP_SEQUENCE = "develop";
const QUADRANT_ANCHORS = [
  [0.14, 0.2],
  [0.86, 0.2],
  [0.14, 0.8],
  [0.86, 0.8],
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function splitFinalWord(text: string) {
  const trimmed = text.trim();
  const separatorIndex = trimmed.lastIndexOf(" ");

  if (separatorIndex === -1) {
    return { leadingText: "", finalWord: trimmed };
  }

  return {
    leadingText: trimmed.slice(0, separatorIndex).trimEnd(),
    finalWord: trimmed.slice(separatorIndex + 1),
  };
}

export function captureElementCenter(element: MeasurableElement | null) {
  if (!element) return undefined;

  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export function clampSpotlightTarget(x: number, y: number) {
  return {
    x: clamp(x, 0.14, 0.86),
    y: clamp(y, 0.16, 0.84),
  };
}

export function getSpotlightSize({
  y,
  lineActive = false,
  ctaActive = false,
  transitioning = false,
}: {
  y: number;
  lineActive?: boolean;
  ctaActive?: boolean;
  transitioning?: boolean;
}) {
  if (transitioning) return 180;
  if (ctaActive) return 250;
  if (lineActive) return 280;
  if (y < 0.2) return 430;
  if (y > 0.32 && y < 0.7) return 300;
  return 360;
}

export function interpolateSpotlight(
  current: SpotlightState,
  target: SpotlightState,
): SpotlightState {
  return {
    x: current.x + (target.x - current.x) * POSITION_LERP,
    y: current.y + (target.y - current.y) * POSITION_LERP,
    size: current.size + (target.size - current.size) * SIZE_LERP,
  };
}

export function isSpotlightSettled(
  current: SpotlightState,
  target: SpotlightState,
): boolean {
  return (
    Math.abs(current.x - target.x) < POSITION_EPSILON &&
    Math.abs(current.y - target.y) < POSITION_EPSILON &&
    Math.abs(current.size - target.size) < SIZE_EPSILON
  );
}

export function getQuadrantOpacities(
  x: number,
  y: number,
): [number, number, number, number] {
  return QUADRANT_ANCHORS.map(([anchorX, anchorY]) => {
    const distance = Math.hypot(x - anchorX, y - anchorY);
    return Math.max(0, 1 - distance / 0.3) * 0.8;
  }) as [number, number, number, number];
}

export function isEditableShortcutTarget({
  tagName,
  isContentEditable,
}: {
  tagName: string;
  isContentEditable: boolean;
}): boolean {
  return (
    isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(tagName.toUpperCase())
  );
}

export function advanceDevelopSequence(buffer: string, key: string) {
  const candidate = `${buffer}${key.toLowerCase()}`;
  if (candidate.endsWith(DEVELOP_SEQUENCE)) {
    return { buffer: "", matched: true };
  }

  for (
    let length = Math.min(candidate.length, DEVELOP_SEQUENCE.length - 1);
    length > 0;
    length -= 1
  ) {
    const suffix = candidate.slice(-length);
    if (DEVELOP_SEQUENCE.startsWith(suffix)) {
      return { buffer: suffix, matched: false };
    }
  }

  return { buffer: "", matched: false };
}

export function nextTemperaturePreset(
  current: TemperaturePreset,
): TemperaturePreset {
  if (current === "warm") return "neutral";
  if (current === "neutral") return "cool";
  return "warm";
}

export function resolveFocusStatus({
  reducedMotion = false,
  locked = false,
  line = null,
  returned = false,
}: {
  reducedMotion?: boolean;
  locked?: boolean;
  line?: number | null;
  returned?: boolean;
}) {
  if (reducedMotion) return "MOTION PREFERENCE RESPECTED";
  if (locked) return "FOCUS LOCKED";
  if (line) return `FOCUS ACQUIRED · LINE ${line}`;
  if (returned) return "FOCUS RETURNED TO CENTRE";
  return "FOCUS READY";
}

export const DEFAULT_SPOTLIGHT_STATE: SpotlightState = DEFAULT_SPOTLIGHT;
