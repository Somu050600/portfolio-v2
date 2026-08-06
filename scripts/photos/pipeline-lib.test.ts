import { describe, expect, test } from "bun:test";
import {
  buildRoleDimensions,
  createCacheKey,
  createPublicId,
  findDuplicateGroups,
  parseGpano,
  sanitizeSourceStem,
} from "./pipeline-lib";
import * as pipelineLib from "./pipeline-lib";

test("excludes unpublished sources and renumbers the remaining cached photos", () => {
  const selectPublishedItems = (
    pipelineLib as Record<string, unknown>
  ).selectPublishedItems;
  const renumberPublishedPhotos = (
    pipelineLib as Record<string, unknown>
  ).renumberPublishedPhotos;
  const restorePublishedCachedPhotos = (
    pipelineLib as Record<string, unknown>
  ).restorePublishedCachedPhotos;

  expect(typeof selectPublishedItems).toBe("function");
  expect(typeof renumberPublishedPhotos).toBe("function");
  expect(typeof restorePublishedCachedPhotos).toBe("function");

  const sources = [
    { checksumSha256: "keep-one", sourceId: "one" },
    { checksumSha256: "remove", sourceId: "duplicate" },
    { checksumSha256: "keep-two", sourceId: "two" },
  ];
  const selected = (
    selectPublishedItems as (
      items: typeof sources,
      curation: Readonly<Record<string, { publish?: boolean }>>,
    ) => typeof sources
  )(sources, { remove: { publish: false } });
  expect(selected.map(({ sourceId }) => sourceId)).toEqual(["one", "two"]);

  const cached = [
    { id: "one", no: "01" },
    { id: "two", no: "22" },
  ];
  const renumbered = (
    renumberPublishedPhotos as <T extends { no: string }>(items: readonly T[]) => T[]
  )(cached);
  expect(renumbered.map(({ no }) => no)).toEqual(["01", "02"]);
  expect(cached[1].no).toBe("22");

  const restored = (
    restorePublishedCachedPhotos as <
      TSource extends { checksumSha256: string },
      TPhoto extends { no: string },
    >(
      items: readonly TSource[],
      curation: Readonly<Record<string, { publish?: boolean }>>,
      lookup: (checksumSha256: string) => TPhoto | undefined,
    ) => TPhoto[]
  )(sources, { remove: { publish: false } }, (checksum) => {
    if (checksum === "keep-one") return { no: "01" };
    if (checksum === "remove") return { no: "19" };
    if (checksum === "keep-two") return { no: "22" };
    return undefined;
  });
  expect(restored.map(({ no }) => no)).toEqual(["01", "02"]);
});

describe("stable photo identity", () => {
  test("creates a URL-safe ID from the source stem and content hash", () => {
    expect(sanitizeSourceStem("PXL_20260405_130246834 (1).jpg")).toBe(
      "pxl-20260405-130246834-1",
    );
    expect(
      createPublicId(
        "PXL_20260405_130246834 (1).jpg",
        "2bf2c47aa6847fb00914a8788245933d7a56fbfcf1df07429e74b594112134eb",
      ),
    ).toBe("pxl-20260405-130246834-1-2bf2c47a");
  });
});

test("invalidates a cached manifest item when curated metadata changes", () => {
  const base = {
    checksumSha256: "source-hash",
    profileVersion: 1,
    sharpVersion: "0.34.5",
    vipsVersion: "8.17.3",
  };
  expect(createCacheKey({ ...base, curation: { alt: "First draft" } })).not.toBe(
    createCacheKey({ ...base, curation: { alt: "Approved description" } }),
  );
});

describe("role sizing", () => {
  test("preserves orientation and never upscales a source", () => {
    expect(buildRoleDimensions(1200, 800, 1600)).toEqual({
      width: 1200,
      height: 800,
    });
    expect(buildRoleDimensions(4000, 2000, 1600)).toEqual({
      width: 1600,
      height: 800,
    });
    expect(buildRoleDimensions(2000, 4000, 320)).toEqual({
      width: 160,
      height: 320,
    });
  });
});

describe("duplicate analysis", () => {
  test("separates exact checksum matches from likely visual matches", () => {
    const groups = findDuplicateGroups([
      { sourceId: "a", checksumSha256: "same", perceptualHash: "00" },
      { sourceId: "b", checksumSha256: "same", perceptualHash: "00" },
      { sourceId: "c", checksumSha256: "other", perceptualHash: "01" },
      { sourceId: "d", checksumSha256: "last", perceptualHash: "ff" },
      {
        sourceId: "e",
        checksumSha256: "edit-one",
        perceptualHash: "f0",
        visualKey: "capture",
      },
      {
        sourceId: "f",
        checksumSha256: "edit-two",
        perceptualHash: "0f",
        visualKey: "capture",
      },
    ]);

    expect(groups).toEqual([
      {
        kind: "exact",
        confidence: 1,
        members: ["a", "b"],
        recommendedPrimary: "a",
        reason: "Identical SHA-256 checksums.",
        requiresManualReview: true,
      },
      {
        kind: "likely-visual",
        confidence: 0.88,
        members: ["a", "c"],
        recommendedPrimary: "a",
        reason: "Perceptual hashes differ by 1 of 8 bits.",
        requiresManualReview: true,
      },
      {
        kind: "likely-visual",
        confidence: 0.9,
        members: ["e", "f"],
        recommendedPrimary: "e",
        reason:
          "Filename stems indicate edited or exported versions of the same capture.",
        requiresManualReview: true,
      },
    ]);
  });
});

describe("panorama metadata", () => {
  test("requires GPano projection metadata instead of a 2:1 ratio alone", () => {
    expect(parseGpano(undefined)).toBeUndefined();
    expect(
      parseGpano(`
        <rdf:Description
          GPano:ProjectionType="equirectangular"
          GPano:UsePanoramaViewer="True"
          GPano:FullPanoWidthPixels="8704"
          GPano:FullPanoHeightPixels="4352"
          GPano:CroppedAreaImageWidthPixels="8704"
          GPano:CroppedAreaImageHeightPixels="4352"
          GPano:CroppedAreaLeftPixels="0"
          GPano:CroppedAreaTopPixels="0" />
      `),
    ).toEqual({
      projectionType: "equirectangular",
      usePanoramaViewer: true,
      fullPanoWidthPixels: 8704,
      fullPanoHeightPixels: 4352,
      croppedAreaImageWidthPixels: 8704,
      croppedAreaImageHeightPixels: 4352,
      croppedAreaLeftPixels: 0,
      croppedAreaTopPixels: 0,
    });
  });
});
