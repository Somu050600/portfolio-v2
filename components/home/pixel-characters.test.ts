import { describe, expect, test } from "bun:test";
import {
  DEFAULT_PIXEL_CHARACTER,
  PIXEL_CHARACTERS,
  advanceGaitPhase,
  getLocalEyeTranslationX,
  getNextCharacterMenuIndex,
  getTwoLegPose,
} from "./pixel-characters";

describe("Pixel character catalog", () => {
  test("defaults to Frog and exposes the six approved choices in picker order", () => {
    expect(DEFAULT_PIXEL_CHARACTER).toBe("frog");
    expect(PIXEL_CHARACTERS.map(({ id, name }) => [id, name])).toEqual([
      ["dog", "Tiny Dog"],
      ["sparrow", "Sparrow"],
      ["cat", "Black Cat"],
      ["penguin", "Penguin"],
      ["frog", "Frog"],
      ["current", "Current Pixel"],
    ]);
    expect(PIXEL_CHARACTERS.some(({ id }) => id === ("ninja" as never))).toBe(
      false,
    );
  });

  test("moves menu focus with arrows and boundary keys", () => {
    expect(getNextCharacterMenuIndex(0, "ArrowDown", 6)).toBe(1);
    expect(getNextCharacterMenuIndex(5, "ArrowDown", 6)).toBe(0);
    expect(getNextCharacterMenuIndex(0, "ArrowUp", 6)).toBe(5);
    expect(getNextCharacterMenuIndex(3, "Home", 6)).toBe(0);
    expect(getNextCharacterMenuIndex(2, "End", 6)).toBe(5);
    expect(getNextCharacterMenuIndex(2, "Enter", 6)).toBeNull();
    expect(getNextCharacterMenuIndex(0, "ArrowDown", 0)).toBeNull();
  });
});

describe("Pixel articulated gait", () => {
  test("keeps each foot inside the 225 to 315 degree arc", () => {
    const common = { hip: { x: 10, y: 10 }, legLength: 10 };

    expect(getTwoLegPose({ ...common, phase: 0, side: 0 }).angleDeg).toBe(315);
    expect(getTwoLegPose({ ...common, phase: Math.PI, side: 0 }).angleDeg).toBe(
      225,
    );
  });

  test("offsets the second leg by half a cycle and lifts only its swing foot", () => {
    const common = {
      hip: { x: 10, y: 10 },
      legLength: 10,
      footLift: 4,
      phase: Math.PI / 2,
    };
    const stance = getTwoLegPose({ ...common, side: 0 });
    const swing = getTwoLegPose({ ...common, side: 1 });

    expect(stance.cycle).toBe(0.25);
    expect(swing.cycle).toBe(0.75);
    expect(stance.swing).toBe(0);
    expect(swing.swing).toBe(1);
    expect(stance.foot.y).toBeCloseTo(20);
    expect(swing.foot.y).toBeCloseTo(16);
    expect(swing.knee.x).toBeGreaterThan(stance.knee.x);
  });

  test("advances phase from distance and freezes it when no distance is traveled", () => {
    expect(advanceGaitPhase(1.25, 0)).toBe(1.25);
    expect(advanceGaitPhase(1.25, 10) - 1.25).toBeCloseTo(
      2 * (advanceGaitPhase(1.25, 5) - 1.25),
    );
  });
});

describe("Pixel eye tracking", () => {
  test("keeps the on-screen eye displacement aligned with the cursor after either body reflection", () => {
    const leftToRightLocalX = getLocalEyeTranslationX(2, 1);
    const rightToLeftLocalX = getLocalEyeTranslationX(2, -1);

    expect(leftToRightLocalX).toBeCloseTo(3.3);
    expect(leftToRightLocalX * 1).toBeCloseTo(3.3);
    expect(rightToLeftLocalX).toBeCloseTo(-0.7);
    expect(rightToLeftLocalX * -1).toBeCloseTo(0.7);
  });
});
