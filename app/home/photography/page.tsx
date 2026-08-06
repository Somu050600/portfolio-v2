import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import HomeShell from "@/components/home/HomeShell";
import PhotographyGallery from "@/components/photography/PhotographyGallery";
import { hiddenPhotoFile, photos } from "@/lib/photography.config";
import { profile } from "@/lib/profile.config";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Photography",
  description: `A selection of film and digital photographs by ${profile.name}, made across six years in Bengaluru, Kerala, and at home.`,
  path: "/home/photography",
});

function getAvailablePhotoFiles(): string[] {
  const photosDirectory = join(process.cwd(), "public", "photos");
  return [...photos.map(({ file }) => file), hiddenPhotoFile].filter((file) =>
    existsSync(join(photosDirectory, file)),
  );
}

export default function PhotographyPage() {
  return (
    <HomeShell showMobileFooter={false}>
      <PhotographyGallery availableFiles={getAvailablePhotoFiles()} />
    </HomeShell>
  );
}
