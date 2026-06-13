export const BUILD_MODE_STORAGE_KEY = "portfolio-build-mode";

export const UI_EVENTS = {
  themeOpenCustomizer: "theme:open-customizer",
  themeToggle: "theme:toggle",
  commandPaletteOpen: "ui:command-palette-open",
} as const;

export type ComponentAttrs = {
  "data-component": string;
  "data-note"?: string;
};

/** Spread onto major blocks for build-mode inspect + commentary. */
export function componentAttrs(
  name: string,
  note?: string,
): ComponentAttrs {
  return note
    ? { "data-component": name, "data-note": note }
    : { "data-component": name };
}
