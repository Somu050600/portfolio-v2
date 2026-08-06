import { expect, test } from "bun:test";
import * as smoothScroll from "./SmoothScroll";

test("uses immediate scrolling for photography without changing other home routes", () => {
  const scrollLerpForRoute = (
    smoothScroll as Record<string, unknown>
  ).scrollLerpForRoute;

  expect(typeof scrollLerpForRoute).toBe("function");
  const lerp = scrollLerpForRoute as (
    pathname: string,
    reducedMotion: boolean,
  ) => number;
  expect(lerp("/home/photography", false)).toBe(1);
  expect(lerp("/home/work", false)).toBe(0.1);
  expect(lerp("/home/work", true)).toBe(1);
});
