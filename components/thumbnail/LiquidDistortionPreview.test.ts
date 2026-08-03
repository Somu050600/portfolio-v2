import { getProjectBySlug } from "@/lib/projects.config";
import { describe, expect, test } from "bun:test";
import * as liquidDemoModule from "@/components/casestudy/demos/LiquidDistortionDemo";
import { registry } from "./registry";

describe("Liquid Distortion thumbnail", () => {
  test("selects its live treatment while preserving the poster fallback", () => {
    const thumbnail = getProjectBySlug("liquid-distortion")?.thumbnail;

    expect(thumbnail).toEqual(
      expect.objectContaining({
        kind: "liquid-distortion",
        poster: "/posters/liquid-distortion.svg",
      }),
    );
  });

  test("produces a bounded moving pointer path for the autoplay loop", () => {
    const getPreviewPointer = (
      liquidDemoModule as typeof liquidDemoModule & {
        getLiquidPreviewPointer?: (timeMs: number) => {
          x: number;
          y: number;
        };
      }
    ).getLiquidPreviewPointer;

    expect(getPreviewPointer).toBeFunction();

    const positions = [0, 500, 1_000, 1_500].map(getPreviewPointer!);
    const uniquePositions = new Set(
      positions.map(({ x, y }) => `${x.toFixed(3)}:${y.toFixed(3)}`),
    );

    expect(uniquePositions.size).toBeGreaterThan(2);
    for (const position of positions) {
      expect(position.x).toBeGreaterThanOrEqual(0.15);
      expect(position.x).toBeLessThanOrEqual(0.85);
      expect(position.y).toBeGreaterThanOrEqual(0.15);
      expect(position.y).toBeLessThanOrEqual(0.85);
    }
  });

  test("registers the hover treatment as an expensive live preview", () => {
    expect(registry["liquid-distortion"]).toBeDefined();
  });
});
