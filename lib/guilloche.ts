export const GUILLOCHE_VIEWBOX = {
  width: 1600,
  height: 1000,
} as const;

export const GUILLOCHE_STROKE_WIDTH = 0.45;

// Draw beyond the viewBox so preserveAspectRatio="none" remains edge-to-edge.
const X_FROM = -120;
const X_TO = 1720;
const Y_FROM = -120;
const Y_TO = 1120;
/**
 * The secondary harmonic is deliberately undersampled. Its aliasing creates
 * the approved engraved grain, so changing this is a visual design change.
 */
const SAMPLE_STEP = 30;

const WAVELENGTH = 300;
const HARMONIC_RATIO = 0.38;
const HARMONIC_GAIN = 0.4;
const ENVELOPE_WAVELENGTH = 520;
const ENVELOPE_FLOOR = 0.34;
const ENVELOPE_RANGE = 0.66;
const PHASE_DRIFT = 0.09;
const AMPLITUDE_GAIN = 1.35;

function linePath(baseY: number, amplitude: number, phase: number): string {
  let d = "";

  for (let x = X_FROM; x <= X_TO; x += SAMPLE_STEP) {
    const envelope =
      ENVELOPE_FLOOR +
      ENVELOPE_RANGE * Math.sin(x / ENVELOPE_WAVELENGTH + phase * 1.6);
    const scaledAmplitude = amplitude * envelope;
    const y =
      baseY +
      scaledAmplitude * Math.sin(x / WAVELENGTH + phase) +
      scaledAmplitude *
        HARMONIC_GAIN *
        Math.sin(x / (WAVELENGTH * HARMONIC_RATIO) + phase * 1.9);

    d += `${d ? "L" : "M"}${x} ${y.toFixed(1)}`;
  }

  return d;
}

function buildGuillochePaths(
  amplitude: number,
  density: number,
): readonly string[] {
  const paths: string[] = [];
  let index = 0;

  for (let y = Y_FROM; y < Y_TO; y += density) {
    paths.push(
      linePath(y, amplitude * AMPLITUDE_GAIN, index * PHASE_DRIFT),
    );
    index += 1;
  }

  return paths;
}

const pathCache = new Map<string, readonly string[]>();

/** Shared engraving geometry for the landing scene and generated OG raster. */
export function getGuillochePaths(
  amplitude: number,
  density: number,
): readonly string[] {
  const key = `${amplitude}:${density}`;
  let paths = pathCache.get(key);

  if (!paths) {
    paths = buildGuillochePaths(amplitude, density);
    pathCache.set(key, paths);
  }

  return paths;
}
