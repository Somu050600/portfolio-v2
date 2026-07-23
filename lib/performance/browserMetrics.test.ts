import { describe, expect, test } from "bun:test";
import { readBrowserMetrics } from "./browserMetrics";

describe("readBrowserMetrics", () => {
  test("reports supported heap, device, and canvas measurements", () => {
    const canvas = {
      clientWidth: 640,
      clientHeight: 360,
      width: 1280,
      height: 720,
    } as HTMLCanvasElement;
    const result = readBrowserMetrics(canvas, {
      devicePixelRatio: 2,
      hardwareConcurrency: 8,
      deviceMemoryGb: 16,
      jsHeapBytes: 32 * 1024 * 1024,
      jsHeapLimitBytes: 2048 * 1024 * 1024,
    });

    expect(result.capabilities).toEqual({
      devicePixelRatio: 2,
      canvasCssWidth: 640,
      canvasCssHeight: 360,
      drawingBufferWidth: 1280,
      drawingBufferHeight: 720,
      hardwareConcurrency: 8,
      deviceMemoryGb: 16,
    });
    expect(result.memory?.jsHeapBytes).toBe(32 * 1024 * 1024);
    expect(result.availability?.["browser.heap"]).toBe("available");
  });

  test("marks non-standard heap and device memory APIs unavailable", () => {
    const canvas = {
      clientWidth: 320,
      clientHeight: 180,
      width: 320,
      height: 180,
    } as HTMLCanvasElement;
    const result = readBrowserMetrics(canvas, {
      devicePixelRatio: 1,
      hardwareConcurrency: null,
      deviceMemoryGb: null,
      jsHeapBytes: null,
      jsHeapLimitBytes: null,
    });

    expect(result.memory?.jsHeapBytes).toBeNull();
    expect(result.capabilities?.deviceMemoryGb).toBeNull();
    expect(result.availability?.["browser.heap"]).toBe("unavailable");
    expect(result.availability?.["browser.deviceMemory"]).toBe("unavailable");
  });
});
