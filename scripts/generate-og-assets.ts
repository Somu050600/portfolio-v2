import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import {
  GUILLOCHE_STROKE_WIDTH,
  GUILLOCHE_VIEWBOX,
  getGuillochePaths,
} from "../lib/guilloche";

const width = 1200;
const fullHeight = 630;
const glowWidth = 900;
const glowHeight = 520;
const outputDir = join(process.cwd(), "public/og");

function guillocheLayer(): string {
  const paths = getGuillochePaths(40, 11)
    .map(
      (path) =>
        `<path d="${path}" vector-effect="non-scaling-stroke" />`,
    )
    .join("");

  return `<g fill="none" stroke="#6f7c72" stroke-opacity=".26" stroke-width="${GUILLOCHE_STROKE_WIDTH}">${paths}</g>`;
}

function svg(
  assetWidth: number,
  height: number,
  layers: string,
  viewBox = { width: assetWidth, height },
  stretch = false,
): Buffer {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${assetWidth}" height="${height}" viewBox="0 0 ${viewBox.width} ${viewBox.height}"${stretch ? ' preserveAspectRatio="none"' : ""}>${layers}</svg>`,
  );
}

async function writePng(
  filename: string,
  assetWidth: number,
  height: number,
  layers: string,
  viewBox?: { width: number; height: number },
  stretch?: boolean,
) {
  await sharp(svg(assetWidth, height, layers, viewBox, stretch))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(join(outputDir, filename));
}

await mkdir(outputDir, { recursive: true });
await Promise.all([
  writePng(
    "guilloche-light.png",
    width,
    fullHeight,
    guillocheLayer(),
    GUILLOCHE_VIEWBOX,
    true,
  ),
  writePng(
    "glow-light.png",
    glowWidth,
    glowHeight,
    `<defs><radialGradient id="glow"><stop offset="0" stop-color="#fdfaf3" stop-opacity=".96"/><stop offset=".58" stop-color="#fdfaf3" stop-opacity=".72"/><stop offset="1" stop-color="#fdfaf3" stop-opacity="0"/></radialGradient></defs><rect width="${glowWidth}" height="${glowHeight}" fill="url(#glow)"/>`,
  ),
]);

console.log("Generated the shared light OG assets in public/og");
