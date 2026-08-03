import { describe, expect, test } from "bun:test";
import {
  arrangeWorkProjects,
  getWorkListReserveHeight,
} from "./work-card-layout";

const projects = [
  { number: 12, slug: "twelve" },
  { number: 3, slug: "three" },
  { number: 1, slug: "one" },
  { number: 8, slug: "eight" },
  { number: 2, slug: "two" },
  { number: 7, slug: "seven" },
  { number: 4, slug: "four" },
  { number: 6, slug: "six" },
  { number: 5, slug: "five" },
] as const;

describe("work-card arrangement", () => {
  test("features the lowest numbered project and preserves row-wise number order", () => {
    const result = arrangeWorkProjects(projects);

    expect(result.featured?.slug).toBe("one");
    expect(result.columns[0].map((project) => project.number)).toEqual([
      2, 4, 6, 8,
    ]);
    expect(result.columns[1].map((project) => project.number)).toEqual([
      3, 5, 7, 12,
    ]);
  });

  test("does not mutate the project order supplied by configuration", () => {
    arrangeWorkProjects(projects);
    expect(projects.map((project) => project.number)).toEqual([
      12, 3, 1, 8, 2, 7, 4, 6, 5,
    ]);
  });

  test("renders safely when there is no featured project", () => {
    expect(arrangeWorkProjects([])).toEqual({
      featured: null,
      columns: [[], []],
    });
  });
});

describe("shared hover reserve", () => {
  test("adds one expansion budget on desktop and uses natural height on mobile", () => {
    expect(getWorkListReserveHeight(1_240, 940)).toBe(1_340);
    expect(getWorkListReserveHeight(1_240, 639)).toBeNull();
  });
});
