import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PerformanceMonitor } from "@/lib/performance/PerformanceMonitor";
import type { MetricSource } from "@/lib/performance/types";
import ResourceUsagePanel from "./ResourceUsagePanel";

function createPopulatedMonitor() {
  const source: MetricSource = {
    id: "fixture",
    intervalMs: 1,
    sample: () => ({
      render: { drawCalls: 9, triangles: 1200, programs: 4 },
      resources: { geometries: 6, textures: 5 },
      memory: {
        jsHeapBytes: 64 * 1024 * 1024,
        jsHeapLimitBytes: 512 * 1024 * 1024,
        estimatedGeometryBytes: 1024,
        estimatedTextureBytes: 2048,
        estimatedShadowBytes: 4096,
        estimatedGpuBytes: 7168,
      },
      consumers: [
        {
          id: "shadow",
          label: "Top key shadow",
          category: "shadow-map",
          estimatedBytes: 4096,
        },
      ],
    }),
  };
  const monitor = new PerformanceMonitor({
    publishIntervalMs: 16,
    sources: [source],
  });
  monitor.recordFrame(0);
  monitor.recordFrame(16);
  monitor.recordFrame(32);
  return monitor;
}

describe("ResourceUsagePanel", () => {
  test("compact mode renders stable live summary metrics", () => {
    const html = renderToStaticMarkup(
      <ResourceUsagePanel
        monitor={createPopulatedMonitor()}
        expanded={false}
        onExpandedChange={() => undefined}
        onClose={() => undefined}
      />,
    );
    expect(html).toContain("Resource monitor");
    expect(html).toContain("FPS");
    expect(html).toContain("Draw calls");
    expect(html).toContain("~7.0 KB");
    expect(html).not.toContain("Top consumers");
  });

  test("expanded mode renders attribution and capability sections", () => {
    const html = renderToStaticMarkup(
      <ResourceUsagePanel
        monitor={createPopulatedMonitor()}
        expanded
        onExpandedChange={() => undefined}
        onClose={() => undefined}
      />,
    );
    expect(html).toContain("Top consumers");
    expect(html).toContain("Top key shadow");
    expect(html).toContain("JS heap limit");
    expect(html).toContain("512.0 MB");
    expect(html).toContain("Device &amp; canvas");
    expect(html).toContain("Reset peaks");
  });
});
