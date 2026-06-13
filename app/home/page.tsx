import type { Metadata } from "next";
import HomeShell from "@/components/home/HomeShell";
import ProjectGrid from "@/components/home/ProjectGrid";

export const metadata: Metadata = {
  title: "Work — Somu",
  description: "Selected professional and creative projects.",
};

export default function HomeWorkPage() {
  return (
    <HomeShell>
      <main>
        <ProjectGrid />
      </main>
    </HomeShell>
  );
}
