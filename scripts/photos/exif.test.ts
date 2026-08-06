import { expect, test } from "bun:test";
import { parseExif } from "./exif";

test("reads safe camera fields and detects a private GPS directory", () => {
  const make = Buffer.from("Google\0", "ascii");
  const model = Buffer.from("Pixel 10 Pro\0", "ascii");
  const entryCount = 4;
  const ifdSize = 2 + entryCount * 12 + 4;
  const makeOffset = 8 + ifdSize;
  const modelOffset = makeOffset + make.length;
  const exif = Buffer.alloc(6 + modelOffset + model.length);
  exif.write("Exif\0\0", 0, "binary");
  const tiff = exif.subarray(6);
  tiff.write("II", 0, "ascii");
  tiff.writeUInt16LE(42, 2);
  tiff.writeUInt32LE(8, 4);
  tiff.writeUInt16LE(entryCount, 8);

  const writeEntry = (
    index: number,
    tag: number,
    type: number,
    count: number,
    value: number,
  ) => {
    const offset = 10 + index * 12;
    tiff.writeUInt16LE(tag, offset);
    tiff.writeUInt16LE(type, offset + 2);
    tiff.writeUInt32LE(count, offset + 4);
    tiff.writeUInt32LE(value, offset + 8);
  };

  writeEntry(0, 0x010f, 2, make.length, makeOffset);
  writeEntry(1, 0x0110, 2, model.length, modelOffset);
  writeEntry(2, 0x0112, 3, 1, 6);
  writeEntry(3, 0x8825, 4, 1, 128);
  make.copy(tiff, makeOffset);
  model.copy(tiff, modelOffset);

  expect(parseExif(exif)).toEqual({
    make: "Google",
    model: "Pixel 10 Pro",
    orientation: 6,
    hasGps: true,
    hasSerialNumber: false,
  });
});
