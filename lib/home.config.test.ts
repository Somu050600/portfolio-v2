import { describe, expect, test } from "bun:test";
import {
  homeNavItems,
  homeSectionIndex,
  isHomeSectionRoute,
} from "./home.config";

describe("home navigation", () => {
  test("places Photography immediately before Playground", () => {
    expect(homeNavItems.map((item) => [item.key, item.href])).toEqual([
      ["work", "/home"],
      ["experience", "/home/experience"],
      ["about", "/home/about"],
      ["photography", "/home/photography"],
      ["playground", "/home/playground"],
    ]);
  });

  test("derives ordinals from position so no menu can drift", () => {
    expect(homeNavItems.map((item) => item.ordinal)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
    ]);
    expect(homeNavItems.map((item) => item.label)).toEqual([
      "Work",
      "Experience",
      "About",
      "Photography",
      "Playground",
    ]);
  });

  test("uses the visible navigation order for slide direction", () => {
    expect(homeSectionIndex("/home")).toBe(0);
    expect(homeSectionIndex("/home/work/liquid-distortion")).toBe(0);
    expect(homeSectionIndex("/home/experience")).toBe(1);
    expect(homeSectionIndex("/home/about")).toBe(2);
    expect(homeSectionIndex("/home/photography")).toBe(3);
    expect(homeSectionIndex("/home/playground")).toBe(4);
  });

  test("recognizes Photography as a top-level section route", () => {
    expect(isHomeSectionRoute("/home/photography")).toBe(true);
    expect(isHomeSectionRoute("/home/photography/archive")).toBe(false);
  });
});
