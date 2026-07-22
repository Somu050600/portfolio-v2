/**
 * Prop schema + defaults for the "Somu Hero 3D" scene.
 *
 * These mirror the editor props declared in the Claude Design source
 * ("Somu Hero 3D.dc.html", `data-props`). SCHEMA drives the Tweaks panel UI;
 * DEFAULTS are the tuned starting values the scene renders with.
 */

export type HeroProps = {
  // Lighting
  spotIntensity: number;
  exposure: number;
  spotAngle: number;
  spotPenumbra: number;
  spotDecay: number;
  spotColor: string;
  ambientIntensity: number;
  hemiIntensity: number;
  fillIntensity: number;
  topIntensity: number;
  // Spotlight position
  spotX: number;
  spotY: number;
  spotZ: number;
  // Camera
  camX: number;
  camY: number;
  camZ: number;
  // Materials
  bgColor: string;
  wallColor: string;
  floorColor: string;
  wallBump: number;
  rockColor: string;
  leafColor: string;
  // Objects / Motion
  objScale: number;
  parallax: number;
};

export const DEFAULTS: HeroProps = {
  spotIntensity: 110,
  exposure: 0.78,
  spotAngle: 0.48,
  spotPenumbra: 0.16,
  spotDecay: 1.4,
  spotColor: "#ffe0b0",
  ambientIntensity: 0.02,
  hemiIntensity: 0.6,
  fillIntensity: 1.05,
  topIntensity: 0.9,
  spotX: 1.1,
  spotY: 7.2,
  spotZ: 4.4,
  camX: -1.1,
  camY: 0.6,
  camZ: 6.2,
  bgColor: "#c4bca9",
  wallColor: "#bcb4a1",
  floorColor: "#b3ab97",
  wallBump: 0.032,
  rockColor: "#b8b09d",
  leafColor: "#7e8a63",
  objScale: 0.68,
  parallax: 0.75,
};

type RangeKey = {
  [K in keyof HeroProps]: HeroProps[K] extends number ? K : never;
}[keyof HeroProps];
type ColorKey = {
  [K in keyof HeroProps]: HeroProps[K] extends string ? K : never;
}[keyof HeroProps];

export type RangeControl = {
  key: RangeKey;
  type: "range";
  label: string;
  min: number;
  max: number;
  step: number;
};
export type ColorControl = {
  key: ColorKey;
  type: "color";
  label: string;
  options: string[];
};
export type Control = RangeControl | ColorControl;
export type Section = { title: string; controls: Control[] };

export const SCHEMA: Section[] = [
  {
    title: "Lighting",
    controls: [
      { key: "spotIntensity", type: "range", label: "Spotlight intensity", min: 0, max: 800, step: 5 },
      { key: "exposure", type: "range", label: "Exposure", min: 0.4, max: 1.6, step: 0.02 },
      { key: "spotAngle", type: "range", label: "Spotlight width", min: 0.3, max: 1, step: 0.01 },
      { key: "spotPenumbra", type: "range", label: "Edge softness", min: 0, max: 1, step: 0.02 },
      { key: "spotDecay", type: "range", label: "Falloff (decay)", min: 0.5, max: 2.5, step: 0.05 },
      { key: "spotColor", type: "color", label: "Spotlight color", options: ["#fff0d6", "#ffffff", "#ffe0b0", "#eaf0ff"] },
      { key: "ambientIntensity", type: "range", label: "Ambient", min: 0, max: 1, step: 0.02 },
      { key: "hemiIntensity", type: "range", label: "Sky/ground fill", min: 0, max: 1.5, step: 0.05 },
      { key: "fillIntensity", type: "range", label: "Front fill", min: 0, max: 1.5, step: 0.05 },
      { key: "topIntensity", type: "range", label: "Top key (contact shadow)", min: 0, max: 1.5, step: 0.05 },
    ],
  },
  {
    title: "Spotlight position",
    controls: [
      { key: "spotX", type: "range", label: "Spot X", min: -6, max: 6, step: 0.1 },
      { key: "spotY", type: "range", label: "Spot Y (height)", min: 2, max: 10, step: 0.1 },
      { key: "spotZ", type: "range", label: "Spot Z (depth)", min: -4, max: 8, step: 0.1 },
    ],
  },
  {
    title: "Camera",
    controls: [
      { key: "camX", type: "range", label: "Camera X", min: -4, max: 4, step: 0.1 },
      { key: "camY", type: "range", label: "Camera Y (height)", min: 0, max: 5, step: 0.1 },
      { key: "camZ", type: "range", label: "Camera Z (distance)", min: 3, max: 12, step: 0.1 },
    ],
  },
  {
    title: "Materials",
    controls: [
      { key: "bgColor", type: "color", label: "Background", options: ["#c4bca9", "#b8b09d", "#d0c9b8", "#a89f8a"] },
      { key: "wallColor", type: "color", label: "Wall", options: ["#c9c2b0", "#d2cbba", "#bcb4a1", "#c7bea8"] },
      { key: "floorColor", type: "color", label: "Floor", options: ["#c2baa6", "#cbc3af", "#b3ab97", "#c7bfab"] },
      { key: "wallBump", type: "range", label: "Wall texture depth", min: 0, max: 0.08, step: 0.002 },
      { key: "rockColor", type: "color", label: "Stone", options: ["#b8b09d", "#a89f8a", "#c4bcab", "#9d947f"] },
      { key: "leafColor", type: "color", label: "Foliage", options: ["#7e8a63", "#6f7a54", "#8c9670", "#5c6647"] },
    ],
  },
  {
    title: "Objects",
    controls: [{ key: "objScale", type: "range", label: "Object size", min: 0.6, max: 1.6, step: 0.02 }],
  },
  {
    title: "Motion",
    controls: [{ key: "parallax", type: "range", label: "Parallax strength", min: 0, max: 2, step: 0.05 }],
  },
];
