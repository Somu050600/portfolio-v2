# Photography asset pipeline

The pipeline treats the source directory as read-only and writes derivatives only to `public/photos/generated/`. Full source paths, filenames, hashes, GPS findings, duplicate evidence, and validation details go to a private report directory outside the public app.

## Requirements

- Bun or Node.js through this repository
- Sharp 0.34.5, installed as a direct development dependency
- Source images in JPG, JPEG, PNG, WebP, HEIC, HEIF, or DNG format
- Optional same-stem XMP sidecars

The current machine has no full RAW developer. A DNG is processed only when Sharp exposes a sufficiently large embedded 8-bit preview. Otherwise the audit marks it `manual-conversion-required` and generates no fake full-resolution result.

## Commands

Set the source and private report paths for your machine:

```bash
export PHOTO_SOURCE_DIR="/absolute/path/to/source-photos"
export PHOTO_PRIVATE_REPORT_DIR="/absolute/path/to/private-photo-reports"
```

The script accepts `--private-output`; the environment variable above is just a convenient shell value.

Dry-run the complete read-only audit without writing derivatives or reports:

```bash
bun run photos:all --source "$PHOTO_SOURCE_DIR" --private-output "$PHOTO_PRIVATE_REPORT_DIR" --dry-run
```

Run only the audit and private reports:

```bash
bun run photos:audit --source "$PHOTO_SOURCE_DIR" --private-output "$PHOTO_PRIVATE_REPORT_DIR"
```

Generate derivatives and the typed manifest:

```bash
bun run photos:process --source "$PHOTO_SOURCE_DIR" --private-output "$PHOTO_PRIVATE_REPORT_DIR"
```

Validate existing derivatives against the current source audit:

```bash
bun run photos:validate --source "$PHOTO_SOURCE_DIR" --private-output "$PHOTO_PRIVATE_REPORT_DIR"
```

Regenerate the private contact sheet and reports from cached public items:

```bash
bun run photos:report --source "$PHOTO_SOURCE_DIR" --private-output "$PHOTO_PRIVATE_REPORT_DIR"
```

Run audit, processing, validation, and reporting together:

```bash
bun run photos:all --source "$PHOTO_SOURCE_DIR" --private-output "$PHOTO_PRIVATE_REPORT_DIR"
```

Force role regeneration after inspecting a pipeline issue:

```bash
bun run photos:all --source "$PHOTO_SOURCE_DIR" --private-output "$PHOTO_PRIVATE_REPORT_DIR" --force
```

## Review workflow

1. Open `photo-review-contact-sheet.html` in the private report directory.
2. Review `photo-duplicate-review.private.json`; recommendations never delete or exclude a source.
3. Check every DNG outcome in `photo-source-audit.md`. Add a high-resolution same-stem raster or convert the RAW manually when required.
4. Confirm `panorama-360` only where GPano XMP is present. A 2:1 image without GPano remains `possible-panorama` and is handled as an ordinary photo.
5. Review the factual draft alt text in `scripts/photos/curation.ts`, then change its status to `verified` only after editorial approval.
6. Inspect `photo-validation.private.json` for metadata, dimensions, colour space, alpha, source-integrity, GPano, and seam checks.

## Processing profile

The versioned profile lives in `scripts/photos/profile.ts`:

| Role | Size | Format | Quality |
| --- | --- | --- | --- |
| Thumb | 360 px long edge | WebP | 55 |
| Grid | 1400 px long edge | WebP | 72 |
| Viewer | 2800 px long edge | WebP | 84 |
| Placeholder | 32 px long edge | WebP | 30 |
| Panorama | up to 8192 px long edge | JPEG 4:4:4 | 88 |
| Panorama poster | 1600 × 1000 crop | WebP | 76 |

All common roles are auto-oriented, non-upscaled, opaque sRGB outputs. Standard public derivatives contain no EXIF or XMP. Confirmed panorama JPEGs retain only the original GPano XMP required by the viewer.

Increase `processingProfile.version` whenever a role dimension, quality, format, colour, crop, metadata, or encoding decision changes. A profile change invalidates the cache without deleting old files; stale output is reviewed separately.

## Adding photographs

1. Copy new originals into a source directory outside the repository.
2. Keep any XMP sidecar beside its same-stem source.
3. Run the dry-run and review supported-file, panorama, DNG, GPS, and duplicate counts.
4. Run the full pipeline.
5. Add a checksum-keyed factual alt draft to `scripts/photos/curation.ts` if the image has been visually reviewed.
6. Rerun the full pipeline after curation changes. Bump the processing profile when image-processing behavior changes.
7. Review the private contact sheet before publishing the generated manifest and assets.

## Removing a published photograph safely

Do not delete the source automatically. Remove or archive it only through the owner's source-management process. For the website, set `publish: false` on the checksum-keyed entry in `scripts/photos/curation.ts`, rerun the pipeline, confirm no route references the ID, and then remove only that explicit `public/photos/generated/<photo-id>/` directory in a separate reviewed change. Remaining frames are renumbered after cache reads, so cached items cannot keep stale public numbers. The pipeline itself reports stale output and never deletes it.

## Privacy checks

The audit detects EXIF GPS directory pointers and GPS/serial markers in XMP. Validation reopens every public derivative and fails when GPS, serial-number, EXIF, unintended XMP, alpha, non-sRGB output, missing dimensions, or missing GPano metadata is found. For an independent spot check, inspect the private validation JSON and run:

```bash
bun run photos:validate --source "$PHOTO_SOURCE_DIR" --private-output "$PHOTO_PRIVATE_REPORT_DIR"
```

Private reports must never be copied into `public/`, imported by application code, or committed when they contain source filenames or paths.

## Runtime measurements

The latest sanitized local production measurements live in `docs/photography-runtime-metrics.json`. They were captured with a cache-disabled Chromium browser against `next start`; the mobile pass used an emulated 390 × 844 viewport, 3× device scale, 150 ms latency, and 1.6 Mbps download throughput. Treat these as reproducible lab observations, not field data or a performance score.

## Scrolling and virtualization

The gallery does not use JavaScript virtualization. Twenty ratio-reserved frames are small enough to keep in the accessibility tree, while `next/image` defers network work for nineteen of them. Unmounting masonry items with Intersection Observer would introduce blank back-scrolls and repeat image decodes without addressing the measured bottleneck.

The reported heavy scroll feeling came from the global Lenis `lerp: 0.1` interpolation. Photography now uses a `1` lerp for an immediate response while other home routes keep smoothing. In the local wheel-response check, Photography applied 157 px of a 180 px step within 10 ms and settled by 60 ms; the unchanged smooth route applied 35 px at 10 ms and had not fully settled after 250 ms.
