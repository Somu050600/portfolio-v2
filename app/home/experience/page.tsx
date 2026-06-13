import type { Metadata } from "next";
import HomeShell from "@/components/home/HomeShell";
import ExperienceTimeline from "@/components/home/ExperienceTimeline";

export const metadata: Metadata = {
  title: "Experience — Somu",
  description: "Work history — Aurva, CloudSEK, MatBook.",
};

export default function ExperiencePage() {
  return (
    <HomeShell>
      <main className="px-6 py-10 md:px-12 md:py-14 lg:px-16">
        <header className="mb-12 max-w-2xl">
          <h1 className="font-serif text-4xl font-light tracking-tight text-ink md:text-5xl">
            Experience
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-dim md:text-base">
            Three roles across security, compliance, and commerce — with a bias
            toward measurable frontend outcomes.
          </p>
        </header>
        <ExperienceTimeline />
      </main>
    </HomeShell>
  );
}
