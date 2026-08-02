import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import PixelPet from "./PixelPet";

test("renders Pixel as a decorative token-backed sidebar card", () => {
  const html = renderToStaticMarkup(<PixelPet />);

  expect(html).toContain("data-pixel-card");
  expect(html).toContain('aria-hidden="true"');
  expect(html).not.toContain("tabindex=");
  expect(html).toContain("h-38");
  expect(html).toContain("border-border-color");
  expect(html).toContain("data-pixel-track");
  expect(html).toContain("data-pixel-body");
  expect(html).toContain("data-pixel-bubble");
  expect(html).toContain("data-pixel-progress");
});
