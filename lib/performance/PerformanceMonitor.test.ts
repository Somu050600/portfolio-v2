import { describe, expect, test } from "bun:test";
import { PerformanceMonitor } from "./PerformanceMonitor";
import type { MetricSource } from "./types";

function publishFrames(monitor: PerformanceMonitor, end = 560, step = 16) {
  for (let now = 0; now <= end; now += step) monitor.recordFrame(now);
}

describe("PerformanceMonitor", () => {
  test("publishes timing and source data at the configured cadence", () => {
    let sourceSamples = 0;
    const source: MetricSource = {
      id: "renderer",
      intervalMs: 500,
      sample: () => {
        sourceSamples += 1;
        return {
          render: { drawCalls: 7, triangles: 240 },
          memory: { estimatedGpuBytes: 4096 },
        };
      },
    };
    const monitor = new PerformanceMonitor({ sources: [source] });
    let notifications = 0;
    monitor.subscribe(() => notifications++);

    publishFrames(monitor);
    const snapshot = monitor.getSnapshot();

    expect(snapshot.timing.fps).toBeCloseTo(62.5, 1);
    expect(snapshot.timing.averageFrameMs).toBeCloseTo(16, 3);
    expect(snapshot.timing.p95FrameMs).toBe(16);
    expect(snapshot.render.drawCalls).toBe(7);
    expect(snapshot.render.triangles).toBe(240);
    expect(snapshot.memory.estimatedGpuBytes).toBe(4096);
    expect(snapshot.peaks.estimatedGpuBytes).toBe(4096);
    expect(sourceSamples).toBe(1);
    expect(notifications).toBe(1);
  });

  test("keeps healthy source data when another source throws", () => {
    const healthy: MetricSource = {
      id: "healthy",
      intervalMs: 500,
      sample: () => ({ resources: { geometries: 3 } }),
    };
    const failing: MetricSource = {
      id: "failing",
      intervalMs: 500,
      sample: () => {
        throw new Error("context lost");
      },
    };
    const monitor = new PerformanceMonitor({ sources: [healthy, failing] });

    publishFrames(monitor);
    const snapshot = monitor.getSnapshot();

    expect(snapshot.resources.geometries).toBe(3);
    expect(snapshot.availability.healthy).toBe("available");
    expect(snapshot.availability.failing).toBe("error");
    expect(snapshot.sourceErrors.failing).toBe("context lost");
  });

  test("preserves the last valid contribution and clears a recovered error", () => {
    let samples = 0;
    const source: MetricSource = {
      id: "recovering",
      intervalMs: 16,
      sample: () => {
        samples += 1;
        if (samples === 2) throw new Error("temporary failure");
        return { render: { drawCalls: samples } };
      },
    };
    const monitor = new PerformanceMonitor({
      publishIntervalMs: 16,
      sources: [source],
    });
    monitor.recordFrame(0);
    monitor.recordFrame(16);
    monitor.recordFrame(32);

    expect(monitor.getSnapshot().render.drawCalls).toBe(1);
    expect(monitor.getSnapshot().availability.recovering).toBe("error");

    monitor.recordFrame(48);
    expect(monitor.getSnapshot().render.drawCalls).toBe(3);
    expect(monitor.getSnapshot().availability.recovering).toBe("available");
    expect(monitor.getSnapshot().sourceErrors.recovering).toBeUndefined();
  });

  test("pause and resume exclude paused time from frame timing", () => {
    const monitor = new PerformanceMonitor({ publishIntervalMs: 32 });
    monitor.recordFrame(0);
    monitor.recordFrame(16);
    monitor.pause();
    monitor.recordFrame(5_000);
    monitor.resume();
    monitor.recordFrame(6_000);
    monitor.recordFrame(6_016);
    monitor.recordFrame(6_032);

    const snapshot = monitor.getSnapshot();
    expect(snapshot.paused).toBe(false);
    expect(snapshot.timing.p95FrameMs).toBe(16);
  });

  test("resetPeaks uses current values as the new baseline", () => {
    const source: MetricSource = {
      id: "memory",
      intervalMs: 1,
      sample: () => ({
        memory: { estimatedGpuBytes: 2048, jsHeapBytes: 1024 },
      }),
    };
    const monitor = new PerformanceMonitor({
      publishIntervalMs: 16,
      sources: [source],
    });
    publishFrames(monitor, 32, 16);

    monitor.resetPeaks();
    const snapshot = monitor.getSnapshot();
    expect(snapshot.peaks.estimatedGpuBytes).toBe(2048);
    expect(snapshot.peaks.jsHeapBytes).toBe(1024);
  });

  test("dispose clears subscribers and ignores later frames", () => {
    const monitor = new PerformanceMonitor({ publishIntervalMs: 16 });
    let notifications = 0;
    monitor.subscribe(() => notifications++);
    monitor.dispose();
    monitor.recordFrame(0);
    monitor.recordFrame(16);

    expect(notifications).toBe(0);
  });
});
