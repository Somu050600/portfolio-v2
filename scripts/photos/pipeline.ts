import { createHash } from "node:crypto";
import {
  access,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import sharp from "sharp";
import { curationByChecksum } from "./curation";
import { parseExif } from "./exif";
import {
  buildRoleDimensions,
  createCacheKey,
  createPublicId,
  findDuplicateGroups,
  parseGpano,
  renumberPublishedPhotos,
  restorePublishedCachedPhotos,
  selectPublishedItems,
  type DuplicateGroup,
  type GpanoMetadata,
} from "./pipeline-lib";
import { processingProfile } from "./profile";
import type { PhotoAsset, SafeExif } from "../../lib/photography.types";

const SUPPORTED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".dng",
  ".xmp",
]);
const VIDEO_EXTENSIONS = new Set([".mov", ".mp4"]);
const COMMANDS = new Set(["audit", "process", "validate", "report", "all"]);

type Command = "audit" | "process" | "validate" | "report" | "all";
type AuditStatus =
  | "ready"
  | "needs-review"
  | "manual-conversion-required"
  | "corrupt"
  | "unsupported";

type SourcePhotoAudit = {
  sourceId: string;
  privateSourcePath: string;
  originalFilename: string;
  extension: string;
  mimeType?: string;
  byteSize: number;
  checksumSha256: string;
  perceptualHash?: string;
  width?: number;
  height?: number;
  displayWidth?: number;
  displayHeight?: number;
  aspectRatio?: number;
  megapixels?: number;
  orientation?: string;
  colourSpace?: string;
  hasEmbeddedProfile?: boolean;
  captureDate?: string;
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  hasGps: boolean;
  gpsPrivate?: { extractionStatus: string };
  hasSerialNumber: boolean;
  hasXmpSidecar: boolean;
  xmpBytes: number;
  associatedFiles: string[];
  sourceType:
    | "standard-raster"
    | "raw-dng"
    | "panorama-360"
    | "possible-panorama"
    | "unsupported";
  panorama?: GpanoMetadata;
  dngProcessingOutcome?:
    | "converted from edited raster"
    | "converted from RAW + XMP"
    | "converted from conservative RAW defaults"
    | "extracted from embedded preview"
    | "manual conversion required";
  warnings: string[];
  status: AuditStatus;
};

type ValidationFailure = {
  photoId: string;
  sourceFile: string;
  processingStep: string;
  tool: string;
  error: string;
  recommendedAction: string;
};

type CacheEntry = {
  cacheKey: string;
  photo: PhotoAsset;
};

type PipelineCache = {
  profileVersion: number;
  toolVersions: Record<string, string>;
  entries: Record<string, CacheEntry>;
};

type CliOptions = {
  command: Command;
  sourceDir: string;
  outputDir: string;
  privateOutputDir: string;
  manifestPath: string;
  workDir: string;
  force: boolean;
  dryRun: boolean;
};

function optionValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function parseOptions(): CliOptions {
  const command = (process.argv[2] ?? "all") as Command;
  if (!COMMANDS.has(command)) {
    throw new Error(`Unknown command: ${command}`);
  }
  const workDir = process.cwd();
  const sourceDir = optionValue("--source") ?? process.env.PHOTO_SOURCE_DIR;
  if (!sourceDir) {
    throw new Error(
      "Provide --source /path/to/photos or set PHOTO_SOURCE_DIR. The source directory is always treated as read-only.",
    );
  }
  return {
    command,
    sourceDir: path.resolve(sourceDir),
    outputDir: path.resolve(
      optionValue("--output") ?? path.join(workDir, "public/photos/generated"),
    ),
    privateOutputDir: path.resolve(
      optionValue("--private-output") ??
        path.join(os.tmpdir(), "portfolio-v2-photography-private"),
    ),
    manifestPath: path.resolve(
      optionValue("--manifest") ?? path.join(workDir, "lib/photography.generated.ts"),
    ),
    workDir,
    force: process.argv.includes("--force"),
    dryRun: process.argv.includes("--dry-run"),
  };
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === ".DS_Store" || entry.name === "Thumbs.db") continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function sha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function normalizedVisualKey(filename: string): string {
  return path
    .basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/\s*\(\d+\)$/, "")
    .replace(/\.(raw-\d+|original)$/g, "")
    .trim();
}

function mimeFor(format: string | undefined): string | undefined {
  if (format === "jpeg") return "image/jpeg";
  if (format === "png") return "image/png";
  if (format === "webp") return "image/webp";
  if (format === "tiff") return "image/tiff";
  if (format === "heif") return "image/heif";
  return format ? `image/${format}` : undefined;
}

function orientationLabel(value: number | undefined): string | undefined {
  if (!value) return undefined;
  return (
    {
      1: "Horizontal",
      2: "Mirror horizontal",
      3: "Rotate 180",
      4: "Mirror vertical",
      5: "Mirror horizontal and rotate 270 CW",
      6: "Rotate 90 CW",
      7: "Mirror horizontal and rotate 90 CW",
      8: "Rotate 270 CW",
    } as Record<number, string>
  )[value];
}

function extractXmpAttribute(
  xmp: string | undefined,
  names: readonly string[],
): string | undefined {
  if (!xmp) return undefined;
  for (const name of names) {
    const value = xmp.match(new RegExp(`${name}=["']([^"']+)["']`, "i"))?.[1];
    if (value) return value;
  }
  return undefined;
}

function normalizeCaptureDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const exifDate = value.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
  const date = new Date(exifDate);
  return Number.isNaN(date.valueOf()) ? value : date.toISOString();
}

async function perceptualHash(input: Buffer): Promise<string> {
  const { data, info } = await sharp(input, { failOn: "none" })
    .rotate()
    .resize({ width: 17, height: 16, fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let bits = "";
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < 16; x += 1) {
      bits += data[y * info.width + x] > data[y * info.width + x + 1] ? "1" : "0";
    }
  }
  return BigInt(`0b${bits}`).toString(16).padStart(64, "0");
}

async function auditSources(options: CliOptions): Promise<{
  audits: SourcePhotoAudit[];
  duplicates: DuplicateGroup[];
  videoCompanions: string[];
}> {
  const allFiles = await walk(options.sourceDir);
  const sourceFiles = allFiles.filter((file) =>
    SUPPORTED_EXTENSIONS.has(path.extname(file).toLowerCase()),
  );
  const videoCompanions = allFiles
    .filter((file) => VIDEO_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .map((file) => path.relative(options.sourceDir, file));
  const xmpByStem = new Map<string, string[]>();
  for (const file of sourceFiles.filter(
    (candidate) => path.extname(candidate).toLowerCase() === ".xmp",
  )) {
    const stem = path.join(path.dirname(file), path.basename(file, path.extname(file))).toLowerCase();
    const group = xmpByStem.get(stem) ?? [];
    group.push(file);
    xmpByStem.set(stem, group);
  }

  const audits: SourcePhotoAudit[] = [];
  for (const file of sourceFiles) {
    const extension = path.extname(file).toLowerCase();
    const filename = path.basename(file);
    const fileStat = await stat(file);
    const buffer = await readFile(file);
    const checksumSha256 = sha256(buffer);
    const sourceId = createPublicId(filename, checksumSha256);
    const associatedXmp = xmpByStem.get(
      path.join(path.dirname(file), path.basename(file, extension)).toLowerCase(),
    ) ?? [];

    if (extension === ".xmp") {
      audits.push({
        sourceId,
        privateSourcePath: file,
        originalFilename: filename,
        extension,
        byteSize: fileStat.size,
        checksumSha256,
        hasGps: /GPS(Latitude|Longitude)/i.test(buffer.toString("utf8")),
        hasSerialNumber: /SerialNumber/i.test(buffer.toString("utf8")),
        hasXmpSidecar: false,
        xmpBytes: buffer.length,
        associatedFiles: [],
        sourceType: "unsupported",
        warnings: ["Standalone XMP sidecar; associated with a same-stem image when available."],
        status: "unsupported",
      });
      continue;
    }

    try {
      const metadata = await sharp(buffer, { failOn: "none" }).metadata();
      if (!metadata.width || !metadata.height) {
        throw new Error("Image dimensions are unavailable.");
      }
      const exif = parseExif(metadata.exif);
      const xmpText = metadata.xmpAsString ?? metadata.xmp?.toString("utf8");
      const panorama = parseGpano(xmpText);
      const rotated = [5, 6, 7, 8].includes(metadata.orientation ?? 1);
      const displayWidth = rotated ? metadata.height : metadata.width;
      const displayHeight = rotated ? metadata.width : metadata.height;
      const ratio = displayWidth / displayHeight;
      const possiblePanorama = !panorama && ratio >= 1.95 && ratio <= 2.05;
      const xmpHasGps = /GPS(Latitude|Longitude|Altitude)/i.test(xmpText ?? "");
      const xmpHasSerial = /(Camera|Lens|Device)?SerialNumber/i.test(xmpText ?? "");
      const hasGps = exif.hasGps || xmpHasGps;
      const warnings: string[] = [];
      if (hasGps) warnings.push("Private GPS metadata detected; public derivatives must strip it.");
      if (exif.hasSerialNumber || xmpHasSerial) {
        warnings.push("Private serial-number metadata detected; public derivatives must strip it.");
      }
      if (possiblePanorama) {
        warnings.push("2:1 dimensions suggest a possible panorama, but GPano metadata is absent.");
      }
      if (metadata.hasAlpha) warnings.push("Alpha channel will be flattened for public derivatives.");

      let dngProcessingOutcome: SourcePhotoAudit["dngProcessingOutcome"];
      if (extension === ".dng") {
        if (
          (metadata.format === "jpeg" || metadata.format === "tiff") &&
          Math.max(displayWidth, displayHeight) >= 2400 &&
          metadata.depth === "uchar"
        ) {
          dngProcessingOutcome = "extracted from embedded preview";
          warnings.push(
            `No RAW developer is installed; using the ${displayWidth}×${displayHeight} embedded 8-bit preview.`,
          );
        } else {
          dngProcessingOutcome = "manual conversion required";
          warnings.push("No safe high-resolution DNG conversion path is available.");
        }
      }

      const captureDate = normalizeCaptureDate(
        exif.capturedAt ??
          extractXmpAttribute(xmpText, ["xmp:CreateDate", "photoshop:DateCreated"]),
      );
      audits.push({
        sourceId,
        privateSourcePath: file,
        originalFilename: filename,
        extension,
        mimeType: mimeFor(metadata.format),
        byteSize: fileStat.size,
        checksumSha256,
        perceptualHash: await perceptualHash(buffer),
        width: metadata.width,
        height: metadata.height,
        displayWidth,
        displayHeight,
        aspectRatio: Number(ratio.toFixed(6)),
        megapixels: Number(((metadata.width * metadata.height) / 1_000_000).toFixed(2)),
        orientation: orientationLabel(metadata.orientation),
        colourSpace: metadata.space,
        hasEmbeddedProfile: metadata.hasProfile,
        captureDate,
        cameraMake: exif.make,
        cameraModel: exif.model,
        lensModel:
          exif.lensModel ?? extractXmpAttribute(xmpText, ["exifEX:LensModel", "aux:Lens"]),
        focalLength: exif.focalLength,
        aperture: exif.aperture,
        shutterSpeed: exif.shutterSpeed,
        iso: exif.iso,
        hasGps,
        gpsPrivate: hasGps
          ? { extractionStatus: "Presence detected; coordinates intentionally retained only in the untouched source." }
          : undefined,
        hasSerialNumber: exif.hasSerialNumber || xmpHasSerial,
        hasXmpSidecar: associatedXmp.length > 0,
        xmpBytes: metadata.xmp?.length ?? 0,
        associatedFiles: associatedXmp,
        sourceType: panorama
          ? "panorama-360"
          : extension === ".dng"
            ? "raw-dng"
            : possiblePanorama
              ? "possible-panorama"
              : "standard-raster",
        panorama,
        dngProcessingOutcome,
        warnings,
        status:
          dngProcessingOutcome === "manual conversion required"
            ? "manual-conversion-required"
            : possiblePanorama
              ? "needs-review"
              : "ready",
      });
    } catch (error) {
      audits.push({
        sourceId,
        privateSourcePath: file,
        originalFilename: filename,
        extension,
        byteSize: fileStat.size,
        checksumSha256,
        hasGps: false,
        hasSerialNumber: false,
        hasXmpSidecar: associatedXmp.length > 0,
        xmpBytes: 0,
        associatedFiles: associatedXmp,
        sourceType: extension === ".dng" ? "raw-dng" : "unsupported",
        dngProcessingOutcome:
          extension === ".dng" ? "manual conversion required" : undefined,
        warnings: [String(error)],
        status: extension === ".dng" ? "manual-conversion-required" : "corrupt",
      });
    }
  }

  const processable = audits.filter(({ perceptualHash }) => perceptualHash);
  const duplicates = findDuplicateGroups(
    processable.map((audit) => ({
      sourceId: audit.sourceId,
      checksumSha256: audit.checksumSha256,
      perceptualHash: audit.perceptualHash,
      visualKey: normalizedVisualKey(audit.originalFilename),
    })),
  );
  return { audits, duplicates, videoCompanions };
}

function rgbHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue].map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
}

function publicPath(options: CliOptions, filePath: string): string {
  const publicRoot = path.join(options.workDir, "public");
  return `/${path.relative(publicRoot, filePath).split(path.sep).join("/")}`;
}

function outputFilesForPhoto(photo: PhotoAsset, options: CliOptions): string[] {
  const urls = [
    photo.thumbSrc,
    photo.gridSrc,
    photo.viewerSrc,
    photo.posterSrc,
    photo.panoramaSrc,
  ].filter((value): value is string => Boolean(value));
  return urls.map((url) => path.join(options.workDir, "public", url.replace(/^\//, "")));
}

async function cacheIsUsable(entry: CacheEntry | undefined, key: string, options: CliOptions) {
  if (!entry || entry.cacheKey !== key) return false;
  const files = outputFilesForPhoto(entry.photo, options);
  return files.length > 0 && (await Promise.all(files.map(exists))).every(Boolean);
}

function safeExifFor(audit: SourcePhotoAudit): SafeExif | undefined {
  const camera = [audit.cameraMake, audit.cameraModel].filter(Boolean).join(" ") || undefined;
  const exif: SafeExif = {
    camera,
    lens: audit.lensModel,
    focalLength: audit.focalLength,
    aperture: audit.aperture,
    shutterSpeed: audit.shutterSpeed,
    iso: audit.iso,
  };
  return Object.values(exif).some(Boolean) ? exif : undefined;
}

async function writeStandardRole(
  source: string | Buffer,
  output: string,
  width: number,
  height: number,
  quality: number,
) {
  await sharp(source, { failOn: "none" })
    .rotate()
    .flatten({ background: "#111111" })
    .resize({ width, height, fit: "fill", withoutEnlargement: true })
    .toColourspace("srgb")
    .webp({ quality, smartSubsample: true })
    .toFile(output);
}

async function processAudit(
  audit: SourcePhotoAudit,
  index: number,
  options: CliOptions,
): Promise<PhotoAsset> {
  if (!audit.displayWidth || !audit.displayHeight) {
    throw new Error("Missing display dimensions.");
  }
  const source = audit.privateSourcePath;
  const idDir = path.join(options.outputDir, audit.sourceId);
  await mkdir(idDir, { recursive: true });
  const profile = processingProfile.roles;
  const thumbPath = path.join(idDir, "thumb.webp");
  const gridPath = path.join(idDir, "grid.webp");
  const placeholderPath = path.join(idDir, "placeholder.webp");
  const viewerPath = path.join(idDir, "viewer.webp");
  const panoramaPath = path.join(idDir, "panorama.jpg");
  const posterPath = path.join(idDir, "panorama-poster.webp");
  const thumbDimensions = buildRoleDimensions(
    audit.displayWidth,
    audit.displayHeight,
    profile.thumb.longEdge,
  );
  const gridDimensions = buildRoleDimensions(
    audit.displayWidth,
    audit.displayHeight,
    profile.grid.longEdge,
  );
  const placeholderDimensions = buildRoleDimensions(
    audit.displayWidth,
    audit.displayHeight,
    profile.placeholder.longEdge,
  );
  let viewerDimensions = buildRoleDimensions(
    audit.displayWidth,
    audit.displayHeight,
    profile.viewer.longEdge,
  );
  let posterSrc: string | undefined;
  let panoramaSrc: string | undefined;
  let viewerSrc: string | undefined;
  let posterBytes: number | undefined;
  let panoramaBytes: number | undefined;

  if (audit.sourceType === "panorama-360") {
    const metadata = await sharp(source, { failOn: "none" }).metadata();
    const xmp = metadata.xmpAsString ?? metadata.xmp?.toString("utf8");
    if (!xmp || !parseGpano(xmp)) throw new Error("Confirmed panorama is missing readable GPano XMP.");
    await sharp(source, { failOn: "none" })
      .rotate()
      .resize({
        width: Math.min(profile.panorama.longEdge, audit.displayWidth),
        withoutEnlargement: true,
      })
      .toColourspace("srgb")
      .jpeg({ quality: profile.panorama.quality, chromaSubsampling: "4:4:4" })
      .withXmp(xmp)
      .toFile(panoramaPath);
    await sharp(source, { failOn: "none" })
      .rotate()
      .resize({
        width: profile.panoramaPoster.width,
        height: profile.panoramaPoster.height,
        fit: "cover",
        position: "centre",
        withoutEnlargement: true,
      })
      .toColourspace("srgb")
      .webp({ quality: profile.panoramaPoster.quality, smartSubsample: true })
      .toFile(posterPath);
    const posterBuffer = await readFile(posterPath);
    const posterMetadata = await sharp(posterBuffer).metadata();
    const posterWidth = posterMetadata.width ?? profile.panoramaPoster.width;
    const posterHeight = posterMetadata.height ?? profile.panoramaPoster.height;
    await writeStandardRole(
      posterBuffer,
      thumbPath,
      ...Object.values(buildRoleDimensions(posterWidth, posterHeight, profile.thumb.longEdge)) as [number, number],
      profile.thumb.quality,
    );
    await writeStandardRole(
      posterBuffer,
      gridPath,
      ...Object.values(buildRoleDimensions(posterWidth, posterHeight, profile.grid.longEdge)) as [number, number],
      profile.grid.quality,
    );
    await writeStandardRole(
      posterBuffer,
      placeholderPath,
      ...Object.values(buildRoleDimensions(posterWidth, posterHeight, profile.placeholder.longEdge)) as [number, number],
      profile.placeholder.quality,
    );
    viewerDimensions = { width: posterWidth, height: posterHeight };
    posterSrc = publicPath(options, posterPath);
    panoramaSrc = publicPath(options, panoramaPath);
    viewerSrc = posterSrc;
    posterBytes = (await stat(posterPath)).size;
    panoramaBytes = (await stat(panoramaPath)).size;
  } else {
    await writeStandardRole(
      source,
      thumbPath,
      thumbDimensions.width,
      thumbDimensions.height,
      profile.thumb.quality,
    );
    await writeStandardRole(
      source,
      gridPath,
      gridDimensions.width,
      gridDimensions.height,
      profile.grid.quality,
    );
    await writeStandardRole(
      source,
      placeholderPath,
      placeholderDimensions.width,
      placeholderDimensions.height,
      profile.placeholder.quality,
    );
    await writeStandardRole(
      source,
      viewerPath,
      viewerDimensions.width,
      viewerDimensions.height,
      profile.viewer.quality,
    );
    viewerSrc = publicPath(options, viewerPath);
  }

  const placeholder = await readFile(placeholderPath);
  const stats = await sharp(gridPath).stats();
  const dominantColor = rgbHex(
    stats.dominant.r,
    stats.dominant.g,
    stats.dominant.b,
  );
  const curation = curationByChecksum[audit.checksumSha256];
  return {
    id: audit.sourceId,
    no: String(index + 1).padStart(2, "0"),
    type: audit.sourceType === "panorama-360" ? "panorama360" : "photo",
    thumbSrc: publicPath(options, thumbPath),
    gridSrc: publicPath(options, gridPath),
    viewerSrc,
    posterSrc,
    panoramaSrc,
    width: audit.displayWidth,
    height: audit.displayHeight,
    aspectRatio: Number((audit.displayWidth / audit.displayHeight).toFixed(6)),
    orientation:
      audit.sourceType === "panorama-360"
        ? "panorama"
        : audit.displayWidth === audit.displayHeight
          ? "square"
          : audit.displayWidth > audit.displayHeight
            ? "landscape"
            : "portrait",
    dominantColor,
    blurDataURL: `data:image/webp;base64,${placeholder.toString("base64")}`,
    alt: curation?.alt ?? "",
    altStatus: curation?.altStatus ?? "manual-review-required",
    capturedAt: audit.captureDate,
    exif: safeExifFor(audit),
    categories: [],
    tags: [],
    processing: {
      profileVersion: processingProfile.version,
      sourceType: audit.sourceType,
      sourceWidth: audit.width,
      sourceHeight: audit.height,
      sourceBytes: audit.byteSize,
      generatedBytes: {
        thumb: (await stat(thumbPath)).size,
        grid: (await stat(gridPath)).size,
        viewer:
          viewerSrc && viewerSrc !== posterSrc ? (await stat(viewerPath)).size : undefined,
        panorama: panoramaBytes,
        poster: posterBytes,
      },
    },
  };
}

async function loadCache(cachePath: string): Promise<PipelineCache> {
  try {
    return JSON.parse(await readFile(cachePath, "utf8")) as PipelineCache;
  } catch {
    return {
      profileVersion: processingProfile.version,
      toolVersions: {},
      entries: {},
    };
  }
}

function manifestSource(photos: readonly PhotoAsset[], metrics: Record<string, unknown>): string {
  const hiddenPhotoId = photos.at(-1)?.id ?? "";
  return `import type { PhotoAsset } from "./photography.types";\n\nexport const photographyMetrics = ${JSON.stringify(metrics, null, 2)} as const;\n\nexport const photos = ${JSON.stringify(photos, null, 2)} as const satisfies readonly PhotoAsset[];\n\nexport const hiddenPhotoId = ${JSON.stringify(hiddenPhotoId)};\n`;
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function sourceMetrics(audits: readonly SourcePhotoAudit[], duplicates: readonly DuplicateGroup[]) {
  const images = audits.filter((audit) => audit.perceptualHash);
  const ratios = { portrait: 0, landscape: 0, square: 0, panorama: 0 };
  for (const audit of images) {
    if (audit.sourceType === "panorama-360") ratios.panorama += 1;
    else if ((audit.aspectRatio ?? 1) > 1.05) ratios.landscape += 1;
    else if ((audit.aspectRatio ?? 1) < 0.95) ratios.portrait += 1;
    else ratios.square += 1;
  }
  const sizes = images.map(({ byteSize }) => byteSize);
  return {
    recognisedSourceCount: images.length,
    dngCount: images.filter(({ extension }) => extension === ".dng").length,
    confirmedPanoramaCount: images.filter(({ sourceType }) => sourceType === "panorama-360").length,
    possiblePanoramaCount: images.filter(({ sourceType }) => sourceType === "possible-panorama").length,
    totalSourceBytes: sizes.reduce((sum, size) => sum + size, 0),
    medianSourceBytes: Math.round(median(sizes)),
    largestSourceBytes: Math.max(0, ...sizes),
    totalSourceMegapixels: Number(images.reduce((sum, audit) => sum + (audit.megapixels ?? 0), 0).toFixed(2)),
    aspectRatioDistribution: ratios,
    exactDuplicateGroups: duplicates.filter(({ kind }) => kind === "exact").length,
    likelyDuplicateGroups: duplicates.filter(({ kind }) => kind === "likely-visual").length,
    filesContainingGps: images.filter(({ hasGps }) => hasGps).length,
    filesContainingSerialNumbers: images.filter(({ hasSerialNumber }) => hasSerialNumber).length,
    filesRequiringManualConversion: images.filter(({ status }) => status === "manual-conversion-required").length,
  };
}

function outputMetrics(photos: readonly PhotoAsset[]) {
  const role = (name: keyof PhotoAsset["processing"]["generatedBytes"]) =>
    photos.map((photo) => photo.processing.generatedBytes[name] ?? 0).filter(Boolean);
  const roleTotals = Object.fromEntries(
    (["thumb", "grid", "viewer", "panorama", "poster"] as const).map((name) => [
      name,
      role(name).reduce((sum, size) => sum + size, 0),
    ]),
  );
  const generatedPerPhoto = photos.map((photo) =>
    Object.values(photo.processing.generatedBytes).reduce(
      (sum, size) => sum + (size ?? 0),
      0,
    ),
  );
  const reductions = photos.map((photo, index) =>
    1 - generatedPerPhoto[index] / photo.processing.sourceBytes,
  );
  return {
    publishedPhotoCount: photos.length,
    totalGeneratedBytes: generatedPerPhoto.reduce((sum, size) => sum + size, 0),
    bytesByRole: roleTotals,
    medianThumbBytes: Math.round(median(role("thumb"))),
    medianGridBytes: Math.round(median(role("grid"))),
    medianViewerBytes: Math.round(median(role("viewer"))),
    panoramaBytes: role("panorama").reduce((sum, size) => sum + size, 0),
    averageReductionPercent: Number((reductions.reduce((sum, value) => sum + value, 0) / Math.max(1, reductions.length) * 100).toFixed(2)),
    medianReductionPercent: Number((median(reductions) * 100).toFixed(2)),
  };
}

async function processSources(
  options: CliOptions,
  audits: readonly SourcePhotoAudit[],
  duplicates: readonly DuplicateGroup[],
): Promise<{ photos: PhotoAsset[]; metrics: Record<string, unknown>; skipped: number }> {
  const cacheRoot = path.join(options.workDir, ".photo-pipeline");
  const cachePath = path.join(cacheRoot, "cache.json");
  const metricsPath = path.join(cacheRoot, "metrics.json");
  const previousMetrics = await (async () => {
    try {
      return JSON.parse(await readFile(metricsPath, "utf8")) as Record<string, unknown>;
    } catch {
      return {};
    }
  })();
  const cache = await loadCache(cachePath);
  const toolVersions = { sharp: sharp.versions.sharp, vips: sharp.versions.vips };
  const ready = selectPublishedItems(
    audits.filter(
      (audit) => audit.perceptualHash && audit.status !== "manual-conversion-required",
    ),
    curationByChecksum,
  );
  const photos: PhotoAsset[] = [];
  let skipped = 0;
  const startedAt = performance.now();

  for (const [index, audit] of ready.entries()) {
    const cacheKey = createCacheKey({
      checksumSha256: audit.checksumSha256,
      profileVersion: processingProfile.version,
      sharpVersion: toolVersions.sharp,
      vipsVersion: toolVersions.vips,
      curation: curationByChecksum[audit.checksumSha256],
    });
    const cached = cache.entries[audit.checksumSha256];
    if (!options.force && (await cacheIsUsable(cached, cacheKey, options))) {
      photos.push(cached.photo);
      skipped += 1;
      continue;
    }
    const photo = await processAudit(audit, index, options);
    photos.push(photo);
    cache.entries[audit.checksumSha256] = { cacheKey, photo };
  }

  const publishedPhotos = renumberPublishedPhotos(photos);
  const durationMs = Number((performance.now() - startedAt).toFixed(2));
  const source = sourceMetrics(audits, duplicates);
  const output = outputMetrics(publishedPhotos);
  const previousCold = previousMetrics.coldProcessingDurationMs;
  const metrics: Record<string, unknown> = {
    profileVersion: processingProfile.version,
    tools: toolVersions,
    ...source,
    ...output,
    coldProcessingDurationMs:
      typeof previousCold === "number" ? previousCold : durationMs,
    warmRerunDurationMs: skipped === ready.length ? durationMs : undefined,
    skippedFiles: skipped,
    processedFiles: ready.length - skipped,
    failures: 0,
  };

  cache.profileVersion = processingProfile.version;
  cache.toolVersions = toolVersions;
  if (!options.dryRun) {
    await mkdir(cacheRoot, { recursive: true });
    await writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
    await writeFile(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`);
    await writeFile(
      options.manifestPath,
      manifestSource(publishedPhotos, metrics),
    );
  }
  return { photos: publishedPhotos, metrics, skipped };
}

async function panoramaSeamScore(filePath: string): Promise<number> {
  const { data, info } = await sharp(filePath)
    .resize({ width: 512, height: 256, fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let difference = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let channel = 0; channel < info.channels; channel += 1) {
      const left = data[(y * info.width) * info.channels + channel];
      const right = data[(y * info.width + info.width - 1) * info.channels + channel];
      difference += Math.abs(left - right);
    }
  }
  return Number((difference / (info.height * info.channels * 255)).toFixed(4));
}

async function validateOutputs(
  options: CliOptions,
  audits: readonly SourcePhotoAudit[],
  photos: readonly PhotoAsset[],
): Promise<{ failures: ValidationFailure[]; panoramaSeams: Record<string, number> }> {
  const failures: ValidationFailure[] = [];
  const panoramaSeams: Record<string, number> = {};
  const auditById = new Map(audits.map((audit) => [audit.sourceId, audit]));
  const seenIds = new Set<string>();

  for (const photo of photos) {
    const audit = auditById.get(photo.id);
    const sourceFile = audit?.originalFilename ?? "unknown";
    if (seenIds.has(photo.id)) {
      failures.push({
        photoId: photo.id,
        sourceFile,
        processingStep: "manifest",
        tool: "pipeline",
        error: "Duplicate public ID.",
        recommendedAction: "Resolve the ID collision before publishing.",
      });
    }
    seenIds.add(photo.id);
    if (photo.altStatus === "manual-review-required") {
      failures.push({
        photoId: photo.id,
        sourceFile,
        processingStep: "accessibility",
        tool: "curation",
        error: "Alt text requires manual review.",
        recommendedAction: "Review the image and add factual alt text before publishing.",
      });
    }
    for (const filePath of outputFilesForPhoto(photo, options)) {
      try {
        const bytes = await readFile(filePath);
        const metadata = await sharp(bytes).metadata();
        const isPanorama = filePath.endsWith("panorama.jpg");
        if (!metadata.width || !metadata.height) throw new Error("Zero or missing dimensions.");
        if (!isPanorama && metadata.format !== "webp") throw new Error(`Expected WebP, received ${metadata.format}.`);
        if (metadata.space !== "srgb") throw new Error(`Expected sRGB, received ${metadata.space}.`);
        if (metadata.hasAlpha) throw new Error("Unexpected alpha channel.");
        const rawText = bytes.toString("latin1");
        if (/GPS(Latitude|Longitude|Info)|SerialNumber/i.test(rawText)) {
          throw new Error("Private GPS or serial metadata marker remains.");
        }
        if (!isPanorama && (metadata.exif || metadata.xmp)) {
          throw new Error("Metadata remains in a public derivative.");
        }
        if (isPanorama) {
          const xmp = metadata.xmpAsString ?? metadata.xmp?.toString("utf8");
          if (!parseGpano(xmp)) throw new Error("GPano metadata is missing.");
          panoramaSeams[photo.id] = await panoramaSeamScore(filePath);
          if (panoramaSeams[photo.id] > 0.35) {
            throw new Error(`Panorama seam score ${panoramaSeams[photo.id]} exceeds 0.35.`);
          }
        }
      } catch (error) {
        failures.push({
          photoId: photo.id,
          sourceFile,
          processingStep: "public derivative validation",
          tool: "sharp",
          error: String(error),
          recommendedAction: "Regenerate this photo with --force and inspect the source if the failure remains.",
        });
      }
    }
    if (audit) {
      const currentChecksum = sha256(await readFile(audit.privateSourcePath));
      if (currentChecksum !== audit.checksumSha256) {
        failures.push({
          photoId: photo.id,
          sourceFile,
          processingStep: "source integrity",
          tool: "SHA-256",
          error: "Source checksum changed during the pipeline run.",
          recommendedAction: "Stop and restore the untouched source before continuing.",
        });
      }
    }
  }
  return { failures, panoramaSeams };
}

function csvCell(value: unknown): string {
  const text = value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

async function writePrivateReports(
  options: CliOptions,
  audits: readonly SourcePhotoAudit[],
  duplicates: readonly DuplicateGroup[],
  videos: readonly string[],
  photos: readonly PhotoAsset[],
  validation: Awaited<ReturnType<typeof validateOutputs>> | undefined,
  metrics: Record<string, unknown>,
) {
  if (options.dryRun) return;
  await mkdir(options.privateOutputDir, { recursive: true });
  await writeFile(
    path.join(options.privateOutputDir, "photo-source-audit.private.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), sourceRoot: options.sourceDir, audits, videoCompanions: videos }, null, 2)}\n`,
  );
  await writeFile(
    path.join(options.privateOutputDir, "photo-duplicate-review.private.json"),
    `${JSON.stringify(duplicates, null, 2)}\n`,
  );
  await writeFile(
    path.join(options.privateOutputDir, "photo-source-map.private.json"),
    `${JSON.stringify(Object.fromEntries(audits.map((audit) => [audit.sourceId, audit.privateSourcePath])), null, 2)}\n`,
  );
  const csvHeaders = [
    "sourceId",
    "originalFilename",
    "extension",
    "byteSize",
    "width",
    "height",
    "sourceType",
    "status",
    "hasGps",
    "hasSerialNumber",
    "dngProcessingOutcome",
    "warnings",
  ];
  const csv = [
    csvHeaders.map(csvCell).join(","),
    ...audits.map((audit) =>
      csvHeaders
        .map((header) =>
          csvCell(
            header === "warnings"
              ? audit.warnings.join(" | ")
              : audit[header as keyof SourcePhotoAudit],
          ),
        )
        .join(","),
    ),
  ].join("\n");
  await writeFile(path.join(options.privateOutputDir, "photo-source-audit.csv"), `${csv}\n`);
  const markdown = `# Photography source audit\n\n- Recognised images: ${metrics.recognisedSourceCount ?? 0}\n- DNG files: ${metrics.dngCount ?? 0}\n- Confirmed panoramas: ${metrics.confirmedPanoramaCount ?? 0}\n- Possible panoramas: ${metrics.possiblePanoramaCount ?? 0}\n- GPS-bearing sources: ${metrics.filesContainingGps ?? 0}\n- Exact duplicate groups: ${metrics.exactDuplicateGroups ?? 0}\n- Likely duplicate groups: ${metrics.likelyDuplicateGroups ?? 0}\n- Manual conversions: ${metrics.filesRequiringManualConversion ?? 0}\n\n## Review items\n\n${audits.filter((audit) => audit.warnings.length).map((audit) => `- **${audit.originalFilename}** — ${audit.warnings.join(" ")}`).join("\n") || "None."}\n`;
  await writeFile(path.join(options.privateOutputDir, "photo-source-audit.md"), markdown);
  if (validation) {
    await writeFile(
      path.join(options.privateOutputDir, "photo-validation.private.json"),
      `${JSON.stringify(validation, null, 2)}\n`,
    );
  }
  const photoById = new Map(photos.map((photo) => [photo.id, photo]));
  const duplicateById = new Map<string, DuplicateGroup[]>();
  for (const group of duplicates) {
    for (const id of group.members) {
      const current = duplicateById.get(id) ?? [];
      current.push(group);
      duplicateById.set(id, current);
    }
  }
  const cards = audits
    .filter((audit) => audit.perceptualHash)
    .map((audit) => {
      const photo = photoById.get(audit.sourceId);
      const preview = photo
        ? `file://${path.join(options.workDir, "public", photo.gridSrc.replace(/^\//, ""))}`
        : "";
      return `<article><img src="${preview}" alt=""><h2>${audit.originalFilename}</h2><dl><dt>Public ID</dt><dd>${audit.sourceId}</dd><dt>Source</dt><dd>${audit.displayWidth}×${audit.displayHeight} · ${audit.sourceType}</dd><dt>Status</dt><dd>${audit.status}${audit.dngProcessingOutcome ? ` · ${audit.dngProcessingOutcome}` : ""}</dd><dt>Generated bytes</dt><dd>${photo ? Object.values(photo.processing.generatedBytes).reduce((sum, size) => sum + (size ?? 0), 0).toLocaleString() : "not processed"}</dd><dt>Alt status</dt><dd>${photo?.altStatus ?? "not processed"}</dd><dt>Duplicate flags</dt><dd>${duplicateById.get(audit.sourceId)?.map((group) => `${group.kind} (${group.confidence})`).join(", ") ?? "none"}</dd></dl><p>${audit.warnings.join(" ")}</p></article>`;
    })
    .join("\n");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Private photo review</title><style>body{margin:0;padding:24px;background:#171717;color:#eee;font:14px system-ui}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}article{background:#242424;border:1px solid #444;padding:14px}img{display:block;width:100%;aspect-ratio:4/3;object-fit:contain;background:#111}h2{font:600 13px ui-monospace;overflow-wrap:anywhere}dl{display:grid;grid-template-columns:110px 1fr;gap:5px;margin:0}dt{color:#aaa}dd{margin:0}p{color:#f1bb78}</style></head><body><h1>Private photography review</h1><main>${cards}</main></body></html>`;
  await writeFile(path.join(options.privateOutputDir, "photo-review-contact-sheet.html"), html);
}

async function main() {
  const options = parseOptions();
  const { audits, duplicates, videoCompanions } = await auditSources(options);
  const publicAudits = audits.filter((audit) => audit.perceptualHash);
  const dryRunSummary = {
    command: options.command,
    dryRun: options.dryRun,
    sourceFiles: publicAudits.length,
    dngFiles: publicAudits.filter(({ extension }) => extension === ".dng").length,
    confirmedPanoramas: publicAudits.filter(({ sourceType }) => sourceType === "panorama-360").length,
    possiblePanoramas: publicAudits.filter(({ sourceType }) => sourceType === "possible-panorama").length,
    exactDuplicateGroups: duplicates.filter(({ kind }) => kind === "exact").length,
    likelyDuplicateGroups: duplicates.filter(({ kind }) => kind === "likely-visual").length,
    plannedOutput: options.outputDir,
    privateReports: options.privateOutputDir,
  };
  if (options.dryRun) {
    console.log(JSON.stringify(dryRunSummary, null, 2));
    return;
  }

  const shouldProcess = options.command === "process" || options.command === "all";
  const cachePath = path.join(options.workDir, ".photo-pipeline/cache.json");
  let photos: PhotoAsset[] = [];
  let metrics: Record<string, unknown> = sourceMetrics(audits, duplicates);
  let skipped = 0;
  if (shouldProcess) {
    const processed = await processSources(options, audits, duplicates);
    photos = processed.photos;
    metrics = processed.metrics;
    skipped = processed.skipped;
  } else {
    const cache = await loadCache(cachePath);
    photos = restorePublishedCachedPhotos(
      audits,
      curationByChecksum,
      (checksumSha256) => cache.entries[checksumSha256]?.photo,
    );
    if (photos.length > 0) metrics = { ...metrics, ...outputMetrics(photos) };
  }

  const shouldValidate = options.command === "validate" || options.command === "all";
  const validation = shouldValidate
    ? await validateOutputs(options, audits, photos)
    : undefined;
  if (validation?.failures.length) {
    metrics = { ...metrics, failures: validation.failures.length };
  }

  const shouldReport =
    options.command === "audit" ||
    options.command === "report" ||
    options.command === "all";
  if (shouldReport) {
    await writePrivateReports(
      options,
      audits,
      duplicates,
      videoCompanions,
      photos,
      validation,
      metrics,
    );
  }
  console.log(
    JSON.stringify(
      {
        ...dryRunSummary,
        processed: photos.length - skipped,
        skipped,
        validationFailures: validation?.failures.length ?? null,
        metrics,
      },
      null,
      2,
    ),
  );
  if (validation?.failures.length) process.exitCode = 1;
}

await main();
