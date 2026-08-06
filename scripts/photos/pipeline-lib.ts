import { createHash } from "node:crypto";
import path from "node:path";

export type DuplicateCandidate = {
  sourceId: string;
  checksumSha256: string;
  perceptualHash?: string;
  visualKey?: string;
};

export type DuplicateGroup = {
  kind: "exact" | "likely-visual";
  confidence: number;
  members: string[];
  recommendedPrimary?: string;
  reason: string;
  requiresManualReview: boolean;
};

export type GpanoMetadata = {
  projectionType?: string;
  usePanoramaViewer?: boolean;
  fullPanoWidthPixels?: number;
  fullPanoHeightPixels?: number;
  croppedAreaImageWidthPixels?: number;
  croppedAreaImageHeightPixels?: number;
  croppedAreaLeftPixels?: number;
  croppedAreaTopPixels?: number;
};

export function selectPublishedItems<T extends { checksumSha256: string }>(
  items: readonly T[],
  curation: Readonly<Record<string, { publish?: boolean } | undefined>>,
): T[] {
  return items.filter(
    ({ checksumSha256 }) => curation[checksumSha256]?.publish !== false,
  );
}

export function renumberPublishedPhotos<T extends { no: string }>(
  photos: readonly T[],
): T[] {
  return photos.map((photo, index) => ({
    ...photo,
    no: String(index + 1).padStart(2, "0"),
  }));
}

export function restorePublishedCachedPhotos<
  TSource extends { checksumSha256: string },
  TPhoto extends { no: string },
>(
  sources: readonly TSource[],
  curation: Readonly<Record<string, { publish?: boolean } | undefined>>,
  lookup: (checksumSha256: string) => TPhoto | undefined,
): TPhoto[] {
  const restored: TPhoto[] = [];
  for (const { checksumSha256 } of selectPublishedItems(sources, curation)) {
    const photo = lookup(checksumSha256);
    if (photo) restored.push(photo);
  }
  return renumberPublishedPhotos(restored);
}

export function sanitizeSourceStem(filename: string): string {
  return path
    .basename(filename, path.extname(filename))
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export function createPublicId(filename: string, checksumSha256: string): string {
  const stem = sanitizeSourceStem(filename) || "photo";
  return `${stem}-${checksumSha256.slice(0, 8)}`;
}

export function createCacheKey(input: {
  checksumSha256: string;
  profileVersion: number;
  sharpVersion: string;
  vipsVersion: string;
  curation?: unknown;
}): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        input.checksumSha256,
        input.profileVersion,
        input.sharpVersion,
        input.vipsVersion,
        input.curation ?? null,
      ]),
    )
    .digest("hex");
}

export function buildRoleDimensions(
  width: number,
  height: number,
  longEdge: number,
): { width: number; height: number } {
  const scale = Math.min(1, longEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function hammingDistanceHex(left: string, right: string): number {
  const length = Math.max(left.length, right.length);
  const a = left.padStart(length, "0");
  const b = right.padStart(length, "0");
  let distance = 0;
  for (let index = 0; index < length; index += 1) {
    const xor = Number.parseInt(a[index], 16) ^ Number.parseInt(b[index], 16);
    distance += xor.toString(2).replaceAll("0", "").length;
  }
  return distance;
}

export function findDuplicateGroups(
  candidates: readonly DuplicateCandidate[],
): DuplicateGroup[] {
  const exactByChecksum = new Map<string, DuplicateCandidate[]>();
  for (const candidate of candidates) {
    const group = exactByChecksum.get(candidate.checksumSha256) ?? [];
    group.push(candidate);
    exactByChecksum.set(candidate.checksumSha256, group);
  }

  const exactGroups = [...exactByChecksum.values()]
    .filter((members) => members.length > 1)
    .map<DuplicateGroup>((members) => ({
      kind: "exact",
      confidence: 1,
      members: members.map(({ sourceId }) => sourceId).sort(),
      recommendedPrimary: members.map(({ sourceId }) => sourceId).sort()[0],
      reason: "Identical SHA-256 checksums.",
      requiresManualReview: true,
    }));

  const representatives = [...exactByChecksum.values()].map((members) =>
    [...members].sort((a, b) => a.sourceId.localeCompare(b.sourceId))[0],
  );
  const likelyGroups: DuplicateGroup[] = [];
  const likelyPairKeys = new Set<string>();

  const byVisualKey = new Map<string, DuplicateCandidate[]>();
  for (const candidate of representatives) {
    if (!candidate.visualKey) continue;
    const group = byVisualKey.get(candidate.visualKey) ?? [];
    group.push(candidate);
    byVisualKey.set(candidate.visualKey, group);
  }
  for (const members of byVisualKey.values()) {
    if (members.length < 2) continue;
    const memberIds = members.map(({ sourceId }) => sourceId).sort();
    const pairKey = memberIds.join("|");
    likelyPairKeys.add(pairKey);
    likelyGroups.push({
      kind: "likely-visual",
      confidence: 0.9,
      members: memberIds,
      recommendedPrimary: memberIds[0],
      reason: "Filename stems indicate edited or exported versions of the same capture.",
      requiresManualReview: true,
    });
  }

  for (let leftIndex = 0; leftIndex < representatives.length; leftIndex += 1) {
    const left = representatives[leftIndex];
    if (!left.perceptualHash) continue;
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < representatives.length;
      rightIndex += 1
    ) {
      const right = representatives[rightIndex];
      if (!right.perceptualHash) continue;
      const comparedBits = Math.max(
        left.perceptualHash.length,
        right.perceptualHash.length,
      ) * 4;
      const distance = hammingDistanceHex(
        left.perceptualHash,
        right.perceptualHash,
      );
      const threshold = Math.max(1, Math.floor(comparedBits * 0.08));
      if (distance > threshold) continue;
      const members = [left.sourceId, right.sourceId].sort();
      const pairKey = members.join("|");
      if (likelyPairKeys.has(pairKey)) continue;
      likelyPairKeys.add(pairKey);
      likelyGroups.push({
        kind: "likely-visual",
        confidence: Number((1 - distance / comparedBits).toFixed(2)),
        members,
        recommendedPrimary: members[0],
        reason: `Perceptual hashes differ by ${distance} of ${comparedBits} bits.`,
        requiresManualReview: true,
      });
    }
  }

  return [...exactGroups, ...likelyGroups].sort((a, b) =>
    a.members.join("|").localeCompare(b.members.join("|")),
  );
}

function readAttribute(text: string, name: string): string | undefined {
  return text.match(new RegExp(`${name}=["']([^"']+)["']`, "i"))?.[1];
}

function readNumber(text: string, name: string): number | undefined {
  const value = readAttribute(text, name);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseGpano(xmp: string | undefined): GpanoMetadata | undefined {
  if (!xmp) return undefined;
  const projectionType = readAttribute(xmp, "GPano:ProjectionType");
  const usePanoramaViewer =
    readAttribute(xmp, "GPano:UsePanoramaViewer")?.toLowerCase() === "true";
  if (projectionType?.toLowerCase() !== "equirectangular") return undefined;

  return {
    projectionType,
    usePanoramaViewer,
    fullPanoWidthPixels: readNumber(xmp, "GPano:FullPanoWidthPixels"),
    fullPanoHeightPixels: readNumber(xmp, "GPano:FullPanoHeightPixels"),
    croppedAreaImageWidthPixels: readNumber(
      xmp,
      "GPano:CroppedAreaImageWidthPixels",
    ),
    croppedAreaImageHeightPixels: readNumber(
      xmp,
      "GPano:CroppedAreaImageHeightPixels",
    ),
    croppedAreaLeftPixels: readNumber(xmp, "GPano:CroppedAreaLeftPixels"),
    croppedAreaTopPixels: readNumber(xmp, "GPano:CroppedAreaTopPixels"),
  };
}
