import { describe, expect, test } from "bun:test";
import {
  formatFrameCount,
  photoMeta,
  photos,
  stepPhotoIndex,
} from "./photography.config";

describe("photography data", () => {
  test("keeps all sixteen approved frames in their authored order", () => {
    expect(photos).toHaveLength(16);
    expect(photos[0]).toEqual({
      no: "01",
      title: "Nets, low tide",
      place: "Fort Kochi",
      year: "2023",
      cam: "Pentax K1000",
      exif: "f/8 · 1/1000 · ISO 100",
      tag: "TRAVEL",
      file: "01-nets-low-tide.jpg",
      w: 3000,
      h: 2000,
    });
    expect(photos[15]).toMatchObject({
      no: "16",
      title: "Wet road, neon",
      file: "16-wet-road-neon.jpg",
      w: 3360,
      h: 1440,
    });
  });

  test("retains the mixed aspect-ratio extremes that drive masonry sizing", () => {
    expect(photos.some(({ w, h }) => w / h === 1688 / 3000)).toBe(true);
    expect(photos.some(({ w, h }) => w / h === 3360 / 1440)).toBe(true);
  });

  test("formats the handoff metadata without rewording it", () => {
    expect(photoMeta(photos[0])).toBe(
      "Fort Kochi · Pentax K1000 · f/8 · 1/1000 · ISO 100",
    );
  });
});

describe("photography interaction helpers", () => {
  test("wraps lightbox navigation in both directions", () => {
    expect(stepPhotoIndex(15, 1)).toBe(0);
    expect(stepPhotoIndex(0, -1)).toBe(15);
    expect(stepPhotoIndex(7, 1)).toBe(8);
  });

  test("formats desktop and compact shutter counts", () => {
    expect(formatFrameCount(38, false)).toBe("38 FRAMES SHOT");
    expect(formatFrameCount(39, false)).toBe("39 FRAMES SHOT");
    expect(formatFrameCount(38, true)).toBe("38 SHOT");
  });
});
