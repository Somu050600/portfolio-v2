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

/** Design-system fonts for satori/ImageResponse, read from vendored TTFs. */
export function ogFonts() {
  return [
    {
      name: "Roboto Condensed",
      data: readFileSync(join(dir, "RobotoCondensed-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Roboto Condensed",
      data: readFileSync(join(dir, "RobotoCondensed-Medium.ttf")),
      weight: 500 as const,
      style: "normal" as const,
    },
    {
      name: "Roboto Condensed",
      data: readFileSync(join(dir, "RobotoCondensed-SemiBold.ttf")),
      weight: 600 as const,
      style: "normal" as const,
    },
    {
      name: "Roboto Condensed",
      data: readFileSync(join(dir, "RobotoCondensed-Bold.ttf")),
      weight: 700 as const,
      style: "normal" as const,
    },
    {
      name: "Poppins",
      data: readFileSync(join(dir, "Poppins-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Poppins",
      data: readFileSync(join(dir, "Poppins-Medium.ttf")),
      weight: 500 as const,
      style: "normal" as const,
    },
    {
      name: "Poppins",
      data: readFileSync(join(dir, "Poppins-SemiBold.ttf")),
      weight: 600 as const,
      style: "normal" as const,
    },
    {
      name: "JetBrains Mono",
      data: readFileSync(join(dir, "JetBrainsMono-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "JetBrains Mono",
      data: readFileSync(join(dir, "JetBrainsMono-Medium.ttf")),
      weight: 500 as const,
      style: "normal" as const,
    },
    {
      name: "JetBrains Mono",
      data: readFileSync(join(dir, "JetBrainsMono-SemiBold.ttf")),
      weight: 600 as const,
      style: "normal" as const,
    },
  ];
}
