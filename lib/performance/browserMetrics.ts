import type { MetricContribution, MetricSource } from "./types";

export type BrowserMetricsEnvironment = {
  devicePixelRatio: number;
  hardwareConcurrency: number | null;
  deviceMemoryGb: number | null;
  jsHeapBytes: number | null;
  jsHeapLimitBytes: number | null;
};

type PerformanceMemory = {
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
};

function readEnvironment(): BrowserMetricsEnvironment {
  const browserNavigator = navigator as Navigator & { deviceMemory?: number };
  const browserPerformance = performance as Performance & {
    memory?: PerformanceMemory;
  };
  return {
    devicePixelRatio: window.devicePixelRatio,
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    deviceMemoryGb: browserNavigator.deviceMemory ?? null,
    jsHeapBytes: browserPerformance.memory?.usedJSHeapSize ?? null,
    jsHeapLimitBytes: browserPerformance.memory?.jsHeapSizeLimit ?? null,
  };
}

export function readBrowserMetrics(
  canvas: HTMLCanvasElement,
  environment: BrowserMetricsEnvironment,
): MetricContribution {
  return {
    capabilities: {
      devicePixelRatio: environment.devicePixelRatio,
      canvasCssWidth: canvas.clientWidth,
      canvasCssHeight: canvas.clientHeight,
      drawingBufferWidth: canvas.width,
      drawingBufferHeight: canvas.height,
      hardwareConcurrency: environment.hardwareConcurrency,
      deviceMemoryGb: environment.deviceMemoryGb,
    },
    memory: {
      jsHeapBytes: environment.jsHeapBytes,
      jsHeapLimitBytes: environment.jsHeapLimitBytes,
    },
    availability: {
      "browser.heap":
        environment.jsHeapBytes == null ? "unavailable" : "available",
      "browser.deviceMemory":
        environment.deviceMemoryGb == null ? "unavailable" : "available",
    },
  };
}

export function createBrowserMetricsSource(
  canvas: HTMLCanvasElement,
): MetricSource {
  return {
    id: "browser",
    intervalMs: 500,
    sample: () => readBrowserMetrics(canvas, readEnvironment()),
  };
}
