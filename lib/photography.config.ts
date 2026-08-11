import {
  hiddenPhotoId as generatedHiddenPhotoId,
  photos as generatedPhotos,
} from "./photography.generated";
import type { PhotoAsset } from "./photography.types";

export const photos: readonly PhotoAsset[] = [...generatedPhotos]
  .reverse()
  .map((photo, index) => ({
    ...photo,
    no: String(index + 1).padStart(2, "0"),
  }));
export const hiddenPhotoId: string = generatedHiddenPhotoId;
export type Photo = PhotoAsset;

/**
 * Editorial names, keyed by the generated photo id. "Frame 01"–"Frame 20" gave
 * the eye nothing to hold on to. Kept here rather than in the generated
 * manifest so the pipeline stays free to rewrite itself; an id with no entry
 * falls back to its frame number.
 */
const photoTitles: Readonly<Record<string, string>> = {
  "pxl-20260406-133217115-raw-01-1-13c9267b": "Boat, Hazy Horizon",
  "pxl-20260406-130441622-raw-02-original-d6804b0f": "Cliff Edge",
  "pxl-20260406-042500837-3-29db9ac7": "Spire and Flag",
  "pxl-20260405-130246834-1-2bf2c47a": "Sand, Evening Blue",
  "pxl-20260405-091811223-raw-02-original-0c955e1d": "Red Turban",
  "pxl-20260405-073609554-3-a8525de3": "Sandstone and Hedges",
  "pxl-20260404-023940231-205c1eac": "At the Water's Edge",
  "pxl-20220715-173241364-photosphere-295d2fce": "Pavilion, All Around",
  "pxl-20220320-130606520-photosphere-1cdb9037": "Valley, All Around",
  "img20220320130546-9661814b": "Snow Valley",
  "img20181006163632-060311d6": "Rain on a Leaf",
  "img20180829144207-53652297": "Clock Tower, Storm Light",
  "img20180817150203-8a110ca9": "The Green Climb",
  "img20180817145424-b83e7f16": "Sunken Circle",
  "img20180730075510-d1321d3d": "Pink Foreground",
  "img20180730075246-27dc047c": "Path to the Monument",
  "img-20181015-195513-01-358f1451": "Light Through the Arch",
  "img-20181011-175025-a5d8b245": "White Temple, Grey Sky",
  "effects-aaf368f4": "Birds Over the Tower",
  "20251219-000319-03a8c2a2": "Steps to the River",
};

export function photoLabel(photo: PhotoAsset): string {
  return photo.title ?? photoTitles[photo.id] ?? `Frame ${photo.no}`;
}

/**
 * Empty when neither a capture date nor safe EXIF survived the pipeline. The
 * caller hides the line rather than printing a placeholder, which read as a
 * build artifact leaking into the page.
 */
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
  return [year, ...technical].filter(Boolean).join(" · ");
}

export function stepPhotoIndex(index: number, delta: number): number {
  return (index + delta + photos.length) % photos.length;
}

export function formatFrameCount(count: number, compact: boolean): string {
  return compact ? `${count} SHOT` : `${count} FRAMES SHOT`;
}
