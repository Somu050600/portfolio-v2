import { createOgImage } from "@/lib/og-card";
import { getOgImageMetadata, getOgInputForPath } from "@/lib/og";

const input = getOgInputForPath("/home/playground")!;

export function generateImageMetadata() {
  return getOgImageMetadata(input);
}

export default function Image() {
  return createOgImage(input);
}
