import type { Metadata } from "next";
import HomeShell from "@/components/home/HomeShell";
import ExperienceTimeline from "@/components/home/ExperienceTimeline";
import { profile } from "@/lib/profile.config";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Experience",
  description: `Professional experience of ${profile.name} across frontend engineering, security, compliance, commerce, design systems, and product interfaces.`,
  path: "/home/experience",
});

export default function ExperiencePage() {
  return (
    <HomeShell>
      <main className="mx-auto flex w-full max-w-235 flex-col px-11 pt-10.5 pb-11.5 max-[899px]:px-5 max-[899px]:pt-7 max-[899px]:pb-10">
        <ExperienceTimeline />
      </main>
    </HomeShell>
  );
}
