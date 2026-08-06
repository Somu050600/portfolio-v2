export type SafeExif = {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
};
export type PhotoAsset = {
  id: string;
  no: string;
  type: "photo" | "panorama360";
  thumbSrc: string;
  gridSrc: string;
  viewerSrc?: string;
  posterSrc?: string;
  panoramaSrc?: string;
  width: number;
  height: number;
  aspectRatio: number;
  orientation: "landscape" | "portrait" | "square" | "panorama";
  dominantColor: string;
  blurDataURL?: string;
  alt: string;
  altStatus: "verified" | "draft" | "manual-review-required";
  title?: string;
  caption?: string;
  capturedAt?: string;
  exif?: SafeExif;
  categories: [];
  tags: [];
  processing: {
    profileVersion: number;
    sourceType: string;
    sourceWidth?: number;
    sourceHeight?: number;
    sourceBytes: number;
    generatedBytes: {
      thumb?: number;
      grid?: number;
      viewer?: number;
      panorama?: number;
      poster?: number;
    };
  };
};
