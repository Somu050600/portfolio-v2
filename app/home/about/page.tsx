import type { Metadata } from "next";
import HomeShell from "@/components/home/HomeShell";
import ObfuscatedEmail, { ResumeLink } from "@/components/home/ObfuscatedEmail";
import SkillsGrid from "@/components/home/SkillsGrid";
import { careAbout } from "@/lib/about.config";
import { profile } from "@/lib/profile.config";

export const metadata: Metadata = {
  title: "About — Somu",
  description: profile.narrative,
};

export default function AboutPage() {
  return (
    <HomeShell>
      <main className="px-6 py-10 md:px-12 md:py-14 lg:px-16">
        <header className="mb-10 max-w-2xl">
          <h1 className="font-serif text-4xl font-light tracking-tight text-ink md:text-5xl">
            About
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-dim md:text-lg">
            {profile.narrative}
          </p>
        </header>

        <section className="mb-12 max-w-2xl">
          <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-ink-faint uppercase">
            What I care about
          </h2>
          <ul className="flex flex-col gap-3 text-sm leading-relaxed text-ink-dim">
            {careAbout.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-accent" aria-hidden>
                  ·
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 font-mono text-xs tracking-[0.2em] text-ink-faint uppercase">
            Skills
          </h2>
          <SkillsGrid />
        </section>

        <section className="flex flex-col gap-4 border-t border-border-color pt-8">
          <h2 className="font-mono text-xs tracking-[0.2em] text-ink-faint uppercase">
            Contact
          </h2>
          <ObfuscatedEmail />
          <div className="flex flex-wrap gap-3">
            <ResumeLink />
            {profile.contact.github !== "TODO" && (
              <a
                href={profile.contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-ink-dim hover:text-ink"
              >
                GitHub
              </a>
            )}
            {profile.contact.linkedin !== "TODO" && (
              <a
                href={profile.contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-ink-dim hover:text-ink"
              >
                LinkedIn
              </a>
            )}
          </div>
        </section>
      </main>
    </HomeShell>
  );
}
