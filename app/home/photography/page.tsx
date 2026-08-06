import type { Metadata } from "next";
import HomeShell from "@/components/home/HomeShell";
import PhotographyGallery from "@/components/photography/PhotographyGallery";
import { profile } from "@/lib/profile.config";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Photography",
  description: `A responsive selection of photographs by ${profile.name}, including interactive 360-degree panoramas.`,
  path: "/home/photography",
});

export default function PhotographyPage() {
  return (
    <HomeShell showMobileFooter={false}>
      <PhotographyGallery />
    </HomeShell>
  );
}
