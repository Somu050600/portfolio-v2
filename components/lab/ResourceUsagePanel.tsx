"use client";

import { useSyncExternalStore } from "react";
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import type { PerformanceMonitor } from "@/lib/performance/PerformanceMonitor";
import { cn } from "@/lib/utils";

type Props = {
  monitor: PerformanceMonitor;
  expanded: boolean;
  monoFont?: string;
  onExpandedChange: (expanded: boolean) => void;
  onClose: () => void;
};

const UNAVAILABLE = "Unavailable";

function formatNumber(value: number | null) {
  return value == null ? UNAVAILABLE : Math.round(value).toLocaleString();
}

function formatMs(value: number | null) {
  return value == null ? UNAVAILABLE : `${value.toFixed(1)} ms`;
}

function formatBytes(value: number | null, estimated = false) {
  if (value == null) return UNAVAILABLE;
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${estimated ? "~" : ""}${size.toFixed(1)} ${units[unit]}`;
}

type MetricRowProps = {
  label: string;
  value: string;
};

function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className="grid min-h-6 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-[10px]">
      <dt className="overflow-hidden text-ellipsis whitespace-nowrap text-[rgba(236,231,221,0.66)]">
        {label}
      </dt>
      <dd className="m-0 whitespace-nowrap text-white tabular-nums">{value}</dd>
    </div>
  );
}

const iconButtonClassName =
  "grid size-7 cursor-pointer place-items-center border-0 bg-transparent p-0 text-[rgba(236,231,221,0.72)] hover:text-white";

export default function ResourceUsagePanel({
  monitor,
  expanded,
  monoFont = "'IBM Plex Mono', ui-monospace, monospace",
  onExpandedChange,
  onClose,
}: Props) {
  const snapshot = useSyncExternalStore(
    monitor.subscribe,
    monitor.getSnapshot,
    monitor.getSnapshot,
  );
  const togglePause = () =>
    snapshot.paused ? monitor.resume() : monitor.pause();

  const summary = [
    ["FPS", formatNumber(snapshot.timing.fps)],
    ["P95 frame", formatMs(snapshot.timing.p95FrameMs)],
    ["Draw calls", formatNumber(snapshot.render.drawCalls)],
    ["Triangles", formatNumber(snapshot.render.triangles)],
    ["Est. GPU", formatBytes(snapshot.memory.estimatedGpuBytes, true)],
    ["JS heap", formatBytes(snapshot.memory.jsHeapBytes)],
  ];

  return (
    <aside
      className={cn(
        "absolute top-22 left-[clamp(12px,2.4vw,32px)] z-20 max-h-[calc(100vh-132px)] overflow-hidden rounded-lg border border-white/10 bg-[rgba(38,33,26,0.82)] text-[#ece7dd] shadow-[0_18px_48px_rgba(0,0,0,0.34)] backdrop-blur-lg backdrop-saturate-[1.08] max-[720px]:top-18 max-[720px]:max-h-[calc(100vh-124px)]",
        expanded
          ? "w-[min(340px,calc(100vw-24px))]"
          : "w-[min(292px,calc(100vw-24px))]",
      )}
      aria-label="Resource monitor"
      style={{ fontFamily: monoFont }}
    >
      <header className="flex min-h-11 items-center justify-between py-2 pr-2.5 pl-3">
        <div className="flex min-w-0 items-center gap-2 text-[11px] tracking-normal uppercase">
          <span
            className={cn(
              "size-1.5 flex-none rounded-full bg-[#8fa066]",
              snapshot.paused && "bg-[#a49d8d]",
            )}
            aria-hidden="true"
          />
          <span>Resource monitor</span>
          <span className="text-[9px] text-[rgba(236,231,221,0.46)]">
            {snapshot.paused ? "Paused" : "Live"}
          </span>
        </div>
        <div className="flex gap-0.5">
          <button
            type="button"
            className={iconButtonClassName}
            aria-label={
              snapshot.paused ? "Resume monitoring" : "Pause monitoring"
            }
            title={snapshot.paused ? "Resume monitoring" : "Pause monitoring"}
            onClick={togglePause}
          >
            {snapshot.paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button
            type="button"
            className={iconButtonClassName}
            aria-label="Reset peaks"
            title="Reset peaks"
            onClick={() => monitor.resetPeaks()}
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            className={iconButtonClassName}
            aria-label={
              expanded
                ? "Collapse resource details"
                : "Expand resource details"
            }
            title={expanded ? "Collapse" : "Expand"}
            aria-expanded={expanded}
            onClick={() => onExpandedChange(!expanded)}
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button
            type="button"
            className={iconButtonClassName}
            aria-label="Close resource monitor"
            title="Close"
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 border-t border-white/8">
        {summary.map(([label, value]) => (
          <div
            className="min-h-13.5 min-w-0 border-r border-b border-white/6 px-3 py-2.25 even:border-r-0"
            key={label}
          >
            <span className="block overflow-hidden text-[9px] text-ellipsis whitespace-nowrap text-[rgba(236,231,221,0.52)]">
              {label}
            </span>
            <span className="mt-1 block overflow-hidden text-[13px] text-ellipsis whitespace-nowrap text-white tabular-nums">
              {value}
            </span>
          </div>
        ))}
      </div>

      {expanded && (
        <div className="max-h-[calc(100vh-310px)] overflow-auto pt-1 pr-3 pb-3.5 pl-3 max-[720px]:max-h-[calc(100vh-292px)]">
          <section className="mt-3.5">
            <h3 className="m-0 mb-1.75 text-[9px] font-medium tracking-normal text-[rgba(236,231,221,0.48)] uppercase">
              Memory
            </h3>
            <dl>
              <MetricRow
                label="Geometry estimate"
                value={formatBytes(
                  snapshot.memory.estimatedGeometryBytes,
                  true,
                )}
              />
              <MetricRow
                label="Texture estimate"
                value={formatBytes(
                  snapshot.memory.estimatedTextureBytes,
                  true,
                )}
              />
              <MetricRow
                label="Shadow estimate"
                value={formatBytes(snapshot.memory.estimatedShadowBytes, true)}
              />
              <MetricRow
                label="Peak GPU estimate"
                value={formatBytes(snapshot.peaks.estimatedGpuBytes, true)}
              />
              <MetricRow
                label="Peak JS heap"
                value={formatBytes(snapshot.peaks.jsHeapBytes)}
              />
              <MetricRow
                label="JS heap limit"
                value={formatBytes(snapshot.memory.jsHeapLimitBytes)}
              />
            </dl>
          </section>

          <section className="mt-3.5">
            <h3 className="m-0 mb-1.75 text-[9px] font-medium tracking-normal text-[rgba(236,231,221,0.48)] uppercase">
              Renderer
            </h3>
            <dl>
              <MetricRow
                label="Geometries"
                value={formatNumber(snapshot.resources.geometries)}
              />
              <MetricRow
                label="Textures"
                value={formatNumber(snapshot.resources.textures)}
              />
              <MetricRow
                label="Programs"
                value={formatNumber(snapshot.render.programs)}
              />
              <MetricRow
                label="Lines"
                value={formatNumber(snapshot.render.lines)}
              />
              <MetricRow
                label="Points"
                value={formatNumber(snapshot.render.points)}
              />
              <MetricRow
                label="Peak p95 frame"
                value={formatMs(snapshot.peaks.p95FrameMs)}
              />
            </dl>
          </section>

          <section className="mt-3.5">
            <h3 className="m-0 mb-1.75 text-[9px] font-medium tracking-normal text-[rgba(236,231,221,0.48)] uppercase">
              Top consumers
            </h3>
            {snapshot.consumers.length === 0 ? (
              <p className="m-0 text-[10px] text-[rgba(236,231,221,0.52)]">
                Inventory pending
              </p>
            ) : (
              snapshot.consumers.slice(0, 8).map((consumer) => (
                <div
                  className="grid min-h-8 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-white/5"
                  key={consumer.id}
                >
                  <span className="overflow-hidden text-[10px] text-ellipsis whitespace-nowrap">
                    {consumer.label}
                    <span className="mt-0.5 block text-[8px] tracking-normal text-[rgba(236,231,221,0.4)] uppercase">
                      {consumer.category}
                    </span>
                  </span>
                  <span className="whitespace-nowrap text-white tabular-nums">
                    {formatBytes(consumer.estimatedBytes, true)}
                  </span>
                </div>
              ))
            )}
          </section>

          <section className="mt-3.5">
            <h3 className="m-0 mb-1.75 text-[9px] font-medium tracking-normal text-[rgba(236,231,221,0.48)] uppercase">
              Device &amp; canvas
            </h3>
            <dl>
              <MetricRow
                label="DPR"
                value={
                  snapshot.capabilities.devicePixelRatio?.toFixed(2) ??
                  UNAVAILABLE
                }
              />
              <MetricRow
                label="Canvas CSS"
                value={
                  snapshot.capabilities.canvasCssWidth == null
                    ? UNAVAILABLE
                    : `${snapshot.capabilities.canvasCssWidth} x ${snapshot.capabilities.canvasCssHeight}`
                }
              />
              <MetricRow
                label="Drawing buffer"
                value={
                  snapshot.capabilities.drawingBufferWidth == null
                    ? UNAVAILABLE
                    : `${snapshot.capabilities.drawingBufferWidth} x ${snapshot.capabilities.drawingBufferHeight}`
                }
              />
              <MetricRow
                label="Logical cores"
                value={formatNumber(
                  snapshot.capabilities.hardwareConcurrency,
                )}
              />
              <MetricRow
                label="Device memory"
                value={
                  snapshot.capabilities.deviceMemoryGb == null
                    ? UNAVAILABLE
                    : `${snapshot.capabilities.deviceMemoryGb} GB`
                }
              />
              <MetricRow
                label="Max texture"
                value={formatNumber(snapshot.capabilities.maxTextureSize)}
              />
              <MetricRow
                label="Max samples"
                value={formatNumber(snapshot.capabilities.maxSamples)}
              />
            </dl>
          </section>
        </div>
      )}
    </aside>
  );
}
