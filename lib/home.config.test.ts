import { describe, expect, test } from "bun:test";
import {
  homeNavItems,
  homeSectionIndex,
  isHomeSectionRoute,
} from "./home.config";

describe("home navigation", () => {
  test("places Photography immediately before Playground", () => {
    expect(homeNavItems).toEqual([
      { key: "work", label: "01. Work", href: "/home" },
      {
        key: "experience",
        label: "02. Experience",
        href: "/home/experience",
      },
      { key: "about", label: "03. About", href: "/home/about" },
      {
        key: "photography",
        label: "04. Photography",
        href: "/home/photography",
      },
      {
        key: "playground",
        label: "05. Playground",
        href: "/home/playground",
      },
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
