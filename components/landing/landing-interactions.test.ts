import { describe, expect, test } from "bun:test";
import {
  advanceDevelopSequence,
  captureElementCenter,
  clampSpotlightTarget,
  getQuadrantOpacities,
  getSpotlightSize,
  interpolateSpotlight,
  isEditableShortcutTarget,
  isSpotlightSettled,
  nextTemperaturePreset,
  resolveFocusStatus,
  splitFinalWord,
} from "./landing-interactions";

describe("landing spotlight behavior", () => {
  test("isolates only the final word for the display-font treatment", () => {
    expect(splitFinalWord("Depth in systems.")).toEqual({
      leadingText: "Depth in",
      finalWord: "systems.",
    });
    expect(splitFinalWord("Beautifully.")).toEqual({
      leadingText: "",
      finalWord: "Beautifully.",
    });
  });

  test("captures the element centre as a stable transition origin", () => {
    let rect = { left: 120, top: 480, width: 160, height: 40 };
    const element = {
      getBoundingClientRect: () => rect,
    };

    const captured = captureElementCenter(element);
    rect = { left: 0, top: 0, width: 20, height: 20 };

    expect(captured).toEqual({ x: 200, y: 500 });
  });

  test("keeps the spotlight inside the readable composition", () => {
    expect(clampSpotlightTarget(-1, 2)).toEqual({ x: 0.14, y: 0.84 });
    expect(clampSpotlightTarget(0.6, 0.4)).toEqual({ x: 0.6, y: 0.4 });
  });

  test("prioritizes transition, CTA, and headline focus sizes", () => {
    expect(getSpotlightSize({ y: 0.1 })).toBe(430);
    expect(getSpotlightSize({ y: 0.5 })).toBe(300);
    expect(getSpotlightSize({ y: 0.8 })).toBe(360);
    expect(getSpotlightSize({ y: 0.5, lineActive: true })).toBe(280);
    expect(getSpotlightSize({ y: 0.5, ctaActive: true })).toBe(250);
    expect(
      getSpotlightSize({ y: 0.5, ctaActive: true, transitioning: true }),
    ).toBe(180);
  });

  test("interpolates position and size with their approved weights", () => {
    const next = interpolateSpotlight(
      { x: 0.57, y: 0.45, size: 340 },
      { x: 0.86, y: 0.84, size: 300 },
    );

    expect(next.x).toBeCloseTo(0.58595, 5);
    expect(next.y).toBeCloseTo(0.47145, 5);
    expect(next.size).toBeCloseTo(337.2, 5);
  });

  test("stops the animation only after every value converges", () => {
    expect(
      isSpotlightSettled(
        { x: 0.5704, y: 0.4504, size: 340.3 },
        { x: 0.57, y: 0.45, size: 340 },
      ),
    ).toBe(true);
    expect(
      isSpotlightSettled(
        { x: 0.5705, y: 0.45, size: 340 },
        { x: 0.57, y: 0.45, size: 340 },
      ),
    ).toBe(false);
  });

  test("reveals only the quadrant reached by the interpolated light", () => {
    expect(getQuadrantOpacities(0.14, 0.2)).toEqual([0.8, 0, 0, 0]);
    expect(getQuadrantOpacities(0.86, 0.8)).toEqual([0, 0, 0, 0.8]);
  });
});

describe("landing discovery behavior", () => {
  test("ignores shortcuts while an editable target has focus", () => {
    expect(
      isEditableShortcutTarget({ tagName: "INPUT", isContentEditable: false }),
    ).toBe(true);
    expect(
      isEditableShortcutTarget({
        tagName: "TEXTAREA",
        isContentEditable: false,
      }),
    ).toBe(true);
    expect(
      isEditableShortcutTarget({ tagName: "DIV", isContentEditable: true }),
    ).toBe(true);
    expect(
      isEditableShortcutTarget({
        tagName: "BUTTON",
        isContentEditable: false,
      }),
    ).toBe(false);
  });

  test("detects the develop sequence and recovers after a mismatch", () => {
    let state = { buffer: "", matched: false };
    for (const key of "dexdevelop") {
      state = advanceDevelopSequence(state.buffer, key);
    }

    expect(state).toEqual({ buffer: "", matched: true });
  });

  test("cycles all light temperatures and returns to warm paper", () => {
    expect(nextTemperaturePreset("warm")).toBe("neutral");
    expect(nextTemperaturePreset("neutral")).toBe("cool");
    expect(nextTemperaturePreset("cool")).toBe("warm");
  });

  test("reports the highest-priority focus state", () => {
    expect(resolveFocusStatus({ reducedMotion: true })).toBe(
      "MOTION PREFERENCE RESPECTED",
    );
    expect(resolveFocusStatus({ locked: true, line: 2 })).toBe("FOCUS LOCKED");
    expect(resolveFocusStatus({ line: 2 })).toBe(
      "FOCUS ACQUIRED · LINE 2",
    );
    expect(resolveFocusStatus({ returned: true })).toBe(
      "FOCUS RETURNED TO CENTRE",
    );
    expect(resolveFocusStatus({})).toBe("FOCUS READY");
  });
});
