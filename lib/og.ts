import { readFileSync } from "node:fs";
import { join } from "node:path";

/** OG card canvas — the standard 1.91:1 social ratio. */
export const OG_SIZE = { width: 1200, height: 630 };

/** Brand palette for the OG cards (mirrors the site tokens). */
export const OG = {
  paper: "#ece8df",
  ink: "#2a2620",
  inkDim: "#6e6553",
  inkFaint: "#9a917e",
  accent: "#b85423",
  border: "#d3ccbd",
  dark: "#0a0a0a",
  darkInk: "#ededed",
  darkDim: "#8a8175",
};

const dir = join(process.cwd(), "assets/fonts");

/** Brand fonts for satori/ImageResponse, read from the vendored TTFs. */
export function ogFonts() {
  return [
    {
      name: "Glass Antiqua",
      data: readFileSync(join(dir, "GlassAntiqua-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Source Code Pro",
      data: readFileSync(join(dir, "SourceCodePro-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Source Code Pro",
      data: readFileSync(join(dir, "SourceCodePro-SemiBold.ttf")),
      weight: 600 as const,
      style: "normal" as const,
    },
  ];
}
