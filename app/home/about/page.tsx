import type { Metadata } from "next";
import AboutElements from "@/components/home/AboutElements";
import HomeShell from "@/components/home/HomeShell";
import { profile } from "@/lib/profile.config";
import { aboutJsonLd, createPageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description: `About ${profile.name}, also known as ${profile.handle}, a frontend engineer specialising in React, Next.js, TypeScript, design systems, and web performance.`,
  path: "/home/about",
});

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(aboutJsonLd) }}
      />
      <HomeShell showMobileFooter={false}>
        <AboutElements />
      </HomeShell>
    </>
  );
}
