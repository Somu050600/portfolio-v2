import type { Metadata } from "next";
import HomeShell from "@/components/home/HomeShell";
import ProjectGrid from "@/components/home/ProjectGrid";
import WorkHero from "@/components/home/WorkHero";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Work",
  description:
    "Selected frontend engineering projects by Eega Somasekhara Reddy, covering product interfaces, design systems, performance, and complex enterprise workflows.",
  path: "/home",
});

export default function HomeWorkPage() {
  return (
    <HomeShell>
      <main>
        <WorkHero />
        <ProjectGrid />
      </main>
    </HomeShell>
  );
}
