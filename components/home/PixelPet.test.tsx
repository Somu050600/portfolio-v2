import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import PixelPet from "./PixelPet";

test("renders Dog as the default skin without removing the legacy Pixel renderer", () => {
  const html = renderToStaticMarkup(<PixelPet />);

  expect(html).toContain("data-pixel-card");
  expect(html).toContain("h-38");
  expect(html).toContain("border-border-color");
  expect(html).toContain("data-pixel-track");
  expect(html).toContain("data-pixel-body");
  expect(html).toContain("data-pixel-bubble");
  expect(html).toContain("data-pixel-progress");
  expect(html).toContain('data-pixel-character="dog" data-active="true"');
  expect(html).toContain('data-pixel-character="current"');
  expect(html).toContain("data-pixel-current-renderer");
  expect(html).toContain('aria-label="Choose Pixel character"');
  expect(html).toContain("Tiny Dog");
  expect(html).toContain("Sparrow");
  expect(html).toContain("Black Cat");
  expect(html).toContain("Penguin");
  expect(html).toContain("Frog");
  expect(html).toContain("Current Pixel");
  expect(html).not.toContain("Ninja");
});
