export type MetricAvailability = "available" | "unavailable" | "error";
export type ResourceCategory = "geometry" | "texture" | "shadow-map";

export type ResourceConsumer = {
  id: string;
  label: string;
  category: ResourceCategory;
  estimatedBytes: number;
};

export type TimingMetrics = {
  fps: number | null;
  averageFrameMs: number | null;
  p95FrameMs: number | null;
  sampleCount: number;
};

export type RenderMetrics = {
  drawCalls: number | null;
  triangles: number | null;
  points: number | null;
  lines: number | null;
  programs: number | null;
};

export type ResourceMetrics = {
  geometries: number | null;
  textures: number | null;
};

export type MemoryMetrics = {
  jsHeapBytes: number | null;
  jsHeapLimitBytes: number | null;
  estimatedGeometryBytes: number | null;
  estimatedTextureBytes: number | null;
  estimatedShadowBytes: number | null;
  estimatedGpuBytes: number | null;
};

export type CapabilityMetrics = {
  devicePixelRatio: number | null;
  canvasCssWidth: number | null;
  canvasCssHeight: number | null;
  drawingBufferWidth: number | null;
  drawingBufferHeight: number | null;
  hardwareConcurrency: number | null;
  deviceMemoryGb: number | null;
  maxTextureSize: number | null;
  maxCubemapSize: number | null;
  maxTextures: number | null;
  maxVertexTextures: number | null;
  maxAttributes: number | null;
  maxSamples: number | null;
};

export type PeakMetrics = {
  p95FrameMs: number | null;
  jsHeapBytes: number | null;
  estimatedGpuBytes: number | null;
};

export type PerformanceSnapshot = {
  timestamp: number;
  paused: boolean;
  timing: TimingMetrics;
  render: RenderMetrics;
  resources: ResourceMetrics;
  memory: MemoryMetrics;
  capabilities: CapabilityMetrics;
  consumers: readonly ResourceConsumer[];
  peaks: PeakMetrics;
  availability: Readonly<Record<string, MetricAvailability>>;
  sourceErrors: Readonly<Record<string, string>>;
};

export type MetricContribution = {
  render?: Partial<RenderMetrics>;
  resources?: Partial<ResourceMetrics>;
  memory?: Partial<MemoryMetrics>;
  capabilities?: Partial<CapabilityMetrics>;
  consumers?: readonly ResourceConsumer[];
  availability?: Record<string, MetricAvailability>;
};

export type MetricSampleContext = { now: number };

export interface MetricSource {
  id: string;
  intervalMs: number;
  sample(context: MetricSampleContext): MetricContribution;
}

export function createEmptySnapshot(): PerformanceSnapshot {
  return {
    timestamp: 0,
    paused: false,
    timing: {
      fps: null,
      averageFrameMs: null,
      p95FrameMs: null,
      sampleCount: 0,
    },
    render: {
      drawCalls: null,
      triangles: null,
      points: null,
      lines: null,
      programs: null,
    },
    resources: { geometries: null, textures: null },
    memory: {
      jsHeapBytes: null,
      jsHeapLimitBytes: null,
      estimatedGeometryBytes: null,
      estimatedTextureBytes: null,
      estimatedShadowBytes: null,
      estimatedGpuBytes: null,
    },
    capabilities: {
      devicePixelRatio: null,
      canvasCssWidth: null,
      canvasCssHeight: null,
      drawingBufferWidth: null,
      drawingBufferHeight: null,
      hardwareConcurrency: null,
      deviceMemoryGb: null,
      maxTextureSize: null,
      maxCubemapSize: null,
      maxTextures: null,
      maxVertexTextures: null,
      maxAttributes: null,
      maxSamples: null,
    },
    consumers: [],
    peaks: {
      p95FrameMs: null,
      jsHeapBytes: null,
      estimatedGpuBytes: null,
    },
    availability: {},
    sourceErrors: {},
  };
}
