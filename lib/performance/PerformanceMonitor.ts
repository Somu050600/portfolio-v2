import {
  createEmptySnapshot,
  type MetricContribution,
  type MetricSource,
  type PerformanceSnapshot,
} from "./types";

type SourceState = {
  source: MetricSource;
  lastSampledAt: number;
  contribution: MetricContribution;
};

type Options = {
  publishIntervalMs?: number;
  sources?: MetricSource[];
};

const maxNullable = (a: number | null, b: number | null) => {
  if (a == null) return b;
  if (b == null) return a;
  return Math.max(a, b);
};

function timingFrom(intervals: number[]) {
  if (intervals.length === 0) return createEmptySnapshot().timing;
  const sorted = [...intervals].sort((a, b) => a - b);
  const total = intervals.reduce((sum, value) => sum + value, 0);
  const averageFrameMs = total / intervals.length;
  const p95Index = Math.max(0, Math.ceil(sorted.length * 0.95) - 1);
  return {
    fps: 1000 / averageFrameMs,
    averageFrameMs,
    p95FrameMs: sorted[p95Index],
    sampleCount: intervals.length,
  };
}

export class PerformanceMonitor {
  private readonly publishIntervalMs: number;
  private readonly sourceStates = new Map<string, SourceState>();
  private readonly listeners = new Set<() => void>();
  private frameIntervals: number[] = [];
  private lastFrameAt: number | null = null;
  private lastPublishedAt: number | null = null;
  private snapshot: PerformanceSnapshot = createEmptySnapshot();
  private paused = false;
  private disposed = false;

  constructor({ publishIntervalMs = 500, sources = [] }: Options = {}) {
    this.publishIntervalMs = publishIntervalMs;
    sources.forEach((source) => this.registerSource(source));
  }

  registerSource(source: MetricSource) {
    if (this.disposed) return;
    this.sourceStates.set(source.id, {
      source,
      lastSampledAt: Number.NEGATIVE_INFINITY,
      contribution: {},
    });
  }

  subscribe = (listener: () => void) => {
    if (this.disposed) return () => undefined;
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  recordFrame(now: number) {
    if (this.disposed || this.paused) return;
    if (this.lastFrameAt != null) {
      const interval = now - this.lastFrameAt;
      if (interval > 0 && interval <= 1000) this.frameIntervals.push(interval);
    }
    this.lastFrameAt = now;
    if (this.lastPublishedAt == null) {
      this.lastPublishedAt = now;
      return;
    }
    if (now - this.lastPublishedAt < this.publishIntervalMs) return;
    this.publish(now);
  }

  pause() {
    if (this.disposed || this.paused) return;
    this.paused = true;
    this.lastFrameAt = null;
    this.snapshot = { ...this.snapshot, paused: true };
    this.emit();
  }

  resume() {
    if (this.disposed || !this.paused) return;
    this.paused = false;
    this.lastFrameAt = null;
    this.lastPublishedAt = null;
    this.frameIntervals = [];
    this.snapshot = { ...this.snapshot, paused: false };
    this.emit();
  }

  resetPeaks() {
    if (this.disposed) return;
    this.snapshot = {
      ...this.snapshot,
      peaks: {
        p95FrameMs: this.snapshot.timing.p95FrameMs,
        jsHeapBytes: this.snapshot.memory.jsHeapBytes,
        estimatedGpuBytes: this.snapshot.memory.estimatedGpuBytes,
      },
    };
    this.emit();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.listeners.clear();
    this.sourceStates.clear();
    this.frameIntervals = [];
  }

  private publish(now: number) {
    const availability = { ...this.snapshot.availability };
    const sourceErrors = { ...this.snapshot.sourceErrors };
    for (const state of this.sourceStates.values()) {
      if (now - state.lastSampledAt < state.source.intervalMs) continue;
      try {
        state.contribution = state.source.sample({ now });
        state.lastSampledAt = now;
        availability[state.source.id] = "available";
        delete sourceErrors[state.source.id];
      } catch (error) {
        state.lastSampledAt = now;
        availability[state.source.id] = "error";
        sourceErrors[state.source.id] =
          error instanceof Error ? error.message : "Metric source failed";
      }
    }

    const base = createEmptySnapshot();
    let consumers = base.consumers;
    for (const { contribution } of this.sourceStates.values()) {
      Object.assign(base.render, contribution.render);
      Object.assign(base.resources, contribution.resources);
      Object.assign(base.memory, contribution.memory);
      Object.assign(base.capabilities, contribution.capabilities);
      Object.assign(availability, contribution.availability);
      if (contribution.consumers) consumers = contribution.consumers;
    }

    const timing = timingFrom(this.frameIntervals);
    this.snapshot = Object.freeze({
      ...base,
      timestamp: now,
      paused: false,
      timing,
      consumers: Object.freeze([...consumers]),
      availability: Object.freeze(availability),
      sourceErrors: Object.freeze(sourceErrors),
      peaks: Object.freeze({
        p95FrameMs: maxNullable(
          this.snapshot.peaks.p95FrameMs,
          timing.p95FrameMs,
        ),
        jsHeapBytes: maxNullable(
          this.snapshot.peaks.jsHeapBytes,
          base.memory.jsHeapBytes,
        ),
        estimatedGpuBytes: maxNullable(
          this.snapshot.peaks.estimatedGpuBytes,
          base.memory.estimatedGpuBytes,
        ),
      }),
    });
    this.frameIntervals = [];
    this.lastPublishedAt = now;
    this.emit();
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}
