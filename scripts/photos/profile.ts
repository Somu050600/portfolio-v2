export const processingProfile = {
  version: 1,
  format: "webp",
  colourSpace: "srgb",
  roles: {
    thumb: { longEdge: 360, quality: 55 },
    grid: { longEdge: 1400, quality: 72 },
    viewer: { longEdge: 2800, quality: 84 },
    placeholder: { longEdge: 32, quality: 30 },
    panorama: { longEdge: 8192, quality: 88 },
    panoramaPoster: { width: 1600, height: 1000, quality: 76 },
  },
} as const;
