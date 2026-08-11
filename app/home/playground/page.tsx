import type { Metadata } from "next";
import HomeShell from "@/components/home/HomeShell";
import PlaygroundGrid from "@/components/playground/PlaygroundGrid";
import { profile } from "@/lib/profile.config";
import { createPageMetadata } from "@/lib/seo";
import { typeStyles } from "@/lib/typography";

export const metadata: Metadata = createPageMetadata({
  title: "Playground",
  description: `Interaction studies and frontend experiments by ${profile.name}, including typography, motion, browser APIs, and visual systems.`,
  path: "/home/playground",
});

export default function PlaygroundPage() {
  return (
    <HomeShell>
      <main className="px-6 py-10 md:px-12 md:py-14 lg:px-16">
        <header className="mb-10 max-w-2xl">
          <h1 className={`${typeStyles.pageTitle} text-ink`}>
            Playground
          </h1>
          <p className={`${typeStyles.body} mt-4 text-ink-dim`}>
            Sketches and interaction studies. Heavy demos are code-split and
            pause when off-screen.
          </p>
        </header>
        <PlaygroundGrid />
        {/* Prose instead of placeholder cards: signals what's in flight
            without shipping dead click targets. */}
        <p
          className={`${typeStyles.bodySmall} mt-10 max-w-2xl text-ink-faint`}
        >
          In flight: a shader-based liquid warp, an SVG brush reveal, and an
          accent-harmony explorer wired to the theme tokens. They land here when
          they run.
        </p>
      </main>
    </HomeShell>
  );
}
