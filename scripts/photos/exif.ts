export type ParsedExif = {
  make?: string;
  model?: string;
  orientation?: number;
  capturedAt?: string;
  lensModel?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  hasGps: boolean;
  hasSerialNumber: boolean;
};

type EndianReader = {
  uint16: (offset: number) => number;
  uint32: (offset: number) => number;
};

function cleanAscii(buffer: Buffer): string | undefined {
  const value = buffer.toString("utf8").replace(/\0.*$/, "").trim();
  return value || undefined;
}

function rational(
  tiff: Buffer,
  reader: EndianReader,
  offset: number,
): number | undefined {
  if (offset < 0 || offset + 8 > tiff.length) return undefined;
  const numerator = reader.uint32(offset);
  const denominator = reader.uint32(offset + 4);
  if (denominator === 0) return undefined;
  return numerator / denominator;
}

export function parseExif(exif: Buffer | undefined): ParsedExif {
  const result: ParsedExif = { hasGps: false, hasSerialNumber: false };
  if (!exif || exif.length < 14) return result;
  const tiffStart = exif.subarray(0, 6).toString("binary") === "Exif\0\0" ? 6 : 0;
  const tiff = exif.subarray(tiffStart);
  const byteOrder = tiff.subarray(0, 2).toString("ascii");
  const littleEndian = byteOrder === "II";
  if (!littleEndian && byteOrder !== "MM") return result;
  const reader: EndianReader = {
    uint16: (offset) =>
      littleEndian ? tiff.readUInt16LE(offset) : tiff.readUInt16BE(offset),
    uint32: (offset) =>
      littleEndian ? tiff.readUInt32LE(offset) : tiff.readUInt32BE(offset),
  };

  const typeSize: Record<number, number> = {
    1: 1,
    2: 1,
    3: 2,
    4: 4,
    5: 8,
    7: 1,
    9: 4,
    10: 8,
  };

  const readIfd = (offset: number): Map<number, { type: number; count: number; valueOffset: number; valueField: number }> => {
    const entries = new Map<number, { type: number; count: number; valueOffset: number; valueField: number }>();
    if (offset < 0 || offset + 2 > tiff.length) return entries;
    const count = reader.uint16(offset);
    for (let index = 0; index < count; index += 1) {
      const entry = offset + 2 + index * 12;
      if (entry + 12 > tiff.length) break;
      const tag = reader.uint16(entry);
      const type = reader.uint16(entry + 2);
      const valueCount = reader.uint32(entry + 4);
      const byteLength = (typeSize[type] ?? 1) * valueCount;
      const valueField = entry + 8;
      const valueOffset = byteLength <= 4 ? valueField : reader.uint32(valueField);
      entries.set(tag, { type, count: valueCount, valueOffset, valueField });
    }
    return entries;
  };

  const readAscii = (
    entries: ReturnType<typeof readIfd>,
    tag: number,
  ): string | undefined => {
    const entry = entries.get(tag);
    if (!entry || entry.valueOffset < 0 || entry.valueOffset + entry.count > tiff.length) {
      return undefined;
    }
    return cleanAscii(tiff.subarray(entry.valueOffset, entry.valueOffset + entry.count));
  };

  const readShort = (
    entries: ReturnType<typeof readIfd>,
    tag: number,
  ): number | undefined => {
    const entry = entries.get(tag);
    if (!entry || entry.valueOffset + 2 > tiff.length) return undefined;
    return reader.uint16(entry.valueOffset);
  };

  try {
    if (reader.uint16(2) !== 42) return result;
    const ifd0 = readIfd(reader.uint32(4));
    result.make = readAscii(ifd0, 0x010f);
    result.model = readAscii(ifd0, 0x0110);
    result.orientation = readShort(ifd0, 0x0112);
    result.hasGps = ifd0.has(0x8825);
    result.hasSerialNumber = ifd0.has(0xa431);

    const exifPointer = ifd0.get(0x8769);
    if (exifPointer) {
      const exifIfd = readIfd(reader.uint32(exifPointer.valueField));
      result.capturedAt = readAscii(exifIfd, 0x9003);
      result.lensModel = readAscii(exifIfd, 0xa434);
      result.iso = readShort(exifIfd, 0x8827);
      result.hasSerialNumber ||= exifIfd.has(0xa431) || exifIfd.has(0xa435);

      const exposureEntry = exifIfd.get(0x829a);
      if (exposureEntry) {
        const exposure = rational(tiff, reader, exposureEntry.valueOffset);
        if (exposure !== undefined) {
          result.shutterSpeed = exposure >= 1 ? `${Number(exposure.toFixed(2))}s` : `1/${Math.round(1 / exposure)}s`;
        }
      }
      const apertureEntry = exifIfd.get(0x829d);
      if (apertureEntry) {
        const aperture = rational(tiff, reader, apertureEntry.valueOffset);
        if (aperture !== undefined) result.aperture = `f/${Number(aperture.toFixed(1))}`;
      }
      const focalEntry = exifIfd.get(0x920a);
      if (focalEntry) {
        const focal = rational(tiff, reader, focalEntry.valueOffset);
        if (focal !== undefined) result.focalLength = `${Number(focal.toFixed(1))} mm`;
      }
    }
  } catch {
    return result;
  }

  return result;
}
