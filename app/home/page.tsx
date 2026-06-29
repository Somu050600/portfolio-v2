import type { Metadata } from "next";
import HomeShell from "@/components/home/HomeShell";
import ProjectGrid from "@/components/home/ProjectGrid";
import WorkHero from "@/components/home/WorkHero";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected professional and creative projects.",
};

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
