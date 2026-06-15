import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import BlockRenderer from "@/components/casestudy/BlockRenderer";
import CaseStudySidebar from "@/components/casestudy/CaseStudySidebar";
import Thumbnail from "@/components/thumbnail/Thumbnail";
import {
  getCaseStudySlugs,
  getProjectBySlug,
} from "@/lib/projects.config";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project?.caseStudy) return { title: "Case Study — Somu" };

  return {
    title: `${project.title} — Somu`,
    description: project.caseStudy.tagline,
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project?.caseStudy) notFound();

  const { caseStudy } = project;
  const sectionLinks = caseStudy.sections.map((s) => ({
    id: s.id,
    label: s.heading,
  }));

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <CaseStudySidebar
        sections={sectionLinks}
        projectTitle={project.title}
      />
      <ViewTransition name={`card-${slug}`} share="morph" default="none">
        <main
          data-cs-main
          className="min-w-0 flex-1 px-6 py-10 md:px-12 md:py-14 lg:px-16"
        >
          <header className="mb-12 max-w-3xl border-b border-border-color pb-10">
            <ViewTransition
              name={`card-${slug}-no`}
              share="morph"
              default="none"
            >
              <p className="mb-2 w-fit font-mono text-xs tracking-[0.2em] text-ink-faint uppercase">
                No. {String(project.number).padStart(2, "0")}
              </p>
            </ViewTransition>
            <ViewTransition
              name={`card-${slug}-title`}
              share="morph"
              default="none"
            >
              <h1 className="font-serif text-4xl font-light tracking-tight text-ink md:text-5xl">
                {project.title}
              </h1>
            </ViewTransition>
            <p className="mt-4 text-lg leading-relaxed text-ink-dim">
              {caseStudy.tagline}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {caseStudy.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-border-color bg-surface px-3 py-1 font-mono text-[11px] tracking-wide text-ink-dim uppercase"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <dl className="mt-8 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="font-mono text-xs text-ink-faint uppercase">Role</dt>
                <dd className="mt-1 text-sm text-ink-dim">{project.role}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-faint uppercase">Team</dt>
                <dd className="mt-1 text-sm text-ink-dim">{project.team}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-faint uppercase">
                  Timeframe
                </dt>
                <dd className="mt-1 text-sm text-ink-dim">{project.shipped}</dd>
              </div>
            </dl>
            {project.thumbnail && (
              <ViewTransition
                name={`card-${slug}-thumb`}
                share="morph"
                default="none"
              >
                <div className="mt-8 max-w-xl">
                  <Thumbnail thumbnail={project.thumbnail} />
                </div>
              </ViewTransition>
            )}
          </header>

          <div className="mx-auto max-w-3xl">
            {caseStudy.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                data-cs-section
                className="scroll-mt-28 mb-16 last:mb-0"
              >
                <h2 className="mb-6 font-serif text-2xl font-light text-ink md:text-3xl">
                  {section.heading}
                </h2>
                <BlockRenderer blocks={section.blocks} />
              </section>
            ))}
          </div>
        </main>
      </ViewTransition>
    </div>
  );
}
