import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import SomuHero3D from "./SomuHero3D";

test("scene tools start with tweaks and resources closed", () => {
  const html = renderToStaticMarkup(<SomuHero3D />);

  expect(html).toContain("RESOURCES");
  expect(html.match(/aria-expanded=\"false\"/g)).toHaveLength(2);
});
