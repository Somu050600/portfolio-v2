import {
  hiddenPhotoId as generatedHiddenPhotoId,
  photos as generatedPhotos,
} from "./photography.generated";
import type { PhotoAsset } from "./photography.types";

export const photos: readonly PhotoAsset[] = generatedPhotos;
export const hiddenPhotoId: string = generatedHiddenPhotoId;
export type Photo = PhotoAsset;

export function photoLabel(photo: PhotoAsset): string {
  return photo.title ?? `Frame ${photo.no}`;
}

export function photoMeta(photo: PhotoAsset): string {
  const year = photo.capturedAt?.slice(0, 4);
  const technical = photo.exif
    ? [
        photo.exif.camera,
        photo.exif.lens,
        photo.exif.focalLength,
        photo.exif.aperture,
        photo.exif.shutterSpeed,
        photo.exif.iso ? `ISO ${photo.exif.iso}` : undefined,
      ].filter(Boolean)
    : [];
  return [year, ...technical].filter(Boolean).join(" · ") || "Metadata under review";
}

export function stepPhotoIndex(index: number, delta: number): number {
  return (index + delta + photos.length) % photos.length;
}

export function formatFrameCount(count: number, compact: boolean): string {
  return compact ? `${count} SHOT` : `${count} FRAMES SHOT`;
}
