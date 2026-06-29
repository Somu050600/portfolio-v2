import type { Metadata } from "next";
import HomeShell from "@/components/home/HomeShell";
import PlaygroundGrid from "@/components/playground/PlaygroundGrid";

export const metadata: Metadata = {
  title: "Playground",
  description: "Interactive experiments — type, fluid, shaders, and motion.",
};

export default function PlaygroundPage() {
  return (
    <HomeShell>
      <main className="px-6 py-10 md:px-12 md:py-14 lg:px-16">
        <header className="mb-10 max-w-2xl">
          <h1 className="font-serif text-4xl font-light tracking-tight text-ink md:text-5xl">
            Playground
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-dim md:text-base">
            Sketches and interaction studies — heavy demos are code-split and
            pause when off-screen.
          </p>
        </header>
        <PlaygroundGrid />
      </main>
    </HomeShell>
  );
}
