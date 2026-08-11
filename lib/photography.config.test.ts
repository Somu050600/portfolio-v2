import { describe, expect, test } from "bun:test";
import {
  formatFrameCount,
  photoLabel,
  photoMeta,
  photos,
  stepPhotoIndex,
} from "./photography.config";

describe("generated photography data", () => {
  test("displays the curated sources in reverse with fresh frame numbers", () => {
    expect(photos).toHaveLength(20);
    expect(photos[0]).toMatchObject({
      no: "01",
      id: "pxl-20260406-133217115-raw-01-1-13c9267b",
      width: 6099,
      height: 7624,
      categories: [],
      tags: [],
      altStatus: "draft",
    });
    expect(photos.at(-1)).toMatchObject({
      no: "20",
      id: "20251219-000319-03a8c2a2",
    });
    expect(photos.map(({ no }) => no)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
    ]);
    expect(
      photos.some(({ id }) => id === "pxl-20260405-130246834-45bf4fa6"),
    ).toBe(false);
    expect(
      photos.some(({ id }) => id === "pxl-20260405-073609554-11b0d17b"),
    ).toBe(false);
  });

  test("distinguishes confirmed panoramas without inventing categories", () => {
    const panoramas = photos.filter(({ type }) => type === "panorama360");
    expect(panoramas).toHaveLength(2);
    expect(
      panoramas.every(
        ({ panoramaSrc, posterSrc, categories, tags }) =>
          panoramaSrc?.endsWith("panorama.jpg") &&
          posterSrc?.endsWith("panorama-poster.webp") &&
          categories.length === 0 &&
          tags.length === 0,
      ),
    ).toBe(true);
  });

  test("contains only safe public fields and generated URLs", () => {
    const serialized = JSON.stringify(photos);
    expect(serialized).not.toContain("/Users/");
    expect(serialized).not.toMatch(/GPSLatitude|GPSLongitude|SerialNumber/);
    expect(photos.every(({ gridSrc }) => gridSrc.startsWith("/photos/generated/"))).toBe(true);
  });

  test("formats factual labels and only available technical metadata", () => {
    // Every published frame is named; the frame-number fallback is only for a
    // photograph the pipeline adds before it has been titled.
    expect(photos.every((photo) => !photoLabel(photo).startsWith("Frame "))).toBe(
      true,
    );
    expect(photoLabel(photos[0])).toBe("Boat, Hazy Horizon");
    expect(photoMeta(photos[0])).not.toContain("undefined");
  });

  test("returns an empty meta line instead of a placeholder when EXIF is absent", () => {
    const withoutMetadata = photos.filter(
      (photo) => !photo.capturedAt && !photo.exif,
    );

    expect(withoutMetadata.length).toBeGreaterThan(0);
    for (const photo of withoutMetadata) {
      expect(photoMeta(photo)).toBe("");
    }
  });
});

describe("photography interaction helpers", () => {
  test("wraps lightbox navigation across the generated manifest", () => {
    expect(stepPhotoIndex(19, 1)).toBe(0);
    expect(stepPhotoIndex(0, -1)).toBe(19);
    expect(stepPhotoIndex(7, 1)).toBe(8);
  });

  test("formats desktop and compact shutter counts", () => {
    expect(formatFrameCount(22, false)).toBe("22 FRAMES SHOT");
    expect(formatFrameCount(23, false)).toBe("23 FRAMES SHOT");
    expect(formatFrameCount(22, true)).toBe("22 SHOT");
  });
});
