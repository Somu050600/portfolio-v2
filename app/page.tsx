import { readFileSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import IntroOverlay from "@/components/landing/IntroOverlay";
import WelcomeScene from "@/components/landing/WelcomeScene";
import { createPageMetadata, homepageDescription, homepageTitle } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: homepageTitle,
  description: homepageDescription,
  path: "/",
  absoluteTitle: true,
});

// Both signature SVG files are the single source of truth.
// Extracted at build time so the SVG files, not the components, own the data.

function readStrokePath(): string {
  const svg = readFileSync(
    join(process.cwd(), "assets/svg/signature-stroke.svg"),
    "utf-8",
  );
  const match = svg.match(/\bd="([^"]+)"/);
  if (!match)
    throw new Error("Could not extract path d from signature-stroke.svg");
  return match[1];
}

// Extracts inner SVG content (everything between the <svg> tags).
// Colors are owned by the SVG file itself — export with the correct fills.
function readFillContent(): string {
  const svg = readFileSync(
    join(process.cwd(), "assets/svg/signature-fill.svg"),
    "utf-8",
  );
  return svg
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .trim();
}

export default function LandingPage() {
  const strokePath = readStrokePath();
  const fillContent = readFillContent();

  return (
    <>
      <WelcomeScene />
      <IntroOverlay strokePath={strokePath} fillContent={fillContent} />
    </>
  );
}
