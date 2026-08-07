import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlockRenderer from "@/components/casestudy/BlockRenderer";
import CaseStudyMorph from "@/components/casestudy/CaseStudyMorph";
import CaseStudySidebar from "@/components/casestudy/CaseStudySidebar";
import {
  caseStudyArtifact,
  caseStudyCaption,
  caseStudyDarkSurface,
  caseStudyMetaKey,
  caseStudyMono,
} from "@/components/casestudy/case-study-classes";
import Thumbnail from "@/components/thumbnail/Thumbnail";
import { profile } from "@/lib/profile.config";
import { getCaseStudySlugs, getProjectBySlug } from "@/lib/projects.config";
import { typeStyles } from "@/lib/typography";
import { createPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project?.caseStudy) return { title: "Case Study" };

  const { caseStudy } = project;
  const path = `/home/work/${slug}` as const;

  return createPageMetadata({
    title: project.title,
    description: caseStudy.tagline,
    path,
    type: "article",
  });
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
  const meta = [
    { key: "Role", value: project.role },
    { key: "Team", value: project.team },
    { key: "Timeframe", value: project.shipped },
  ].filter((item) => item.value);
  const heroCaption = project.thumbnail?.alt ?? project.title;

  return (
    <div className="min-h-screen overflow-x-clip bg-bg text-ink">
      <CaseStudyMorph slug={slug} />
      <div className="grid min-h-screen w-full grid-cols-[264px_minmax(0,1fr)] max-lg:block">
        <CaseStudySidebar
          sections={sectionLinks}
          projectTitle={project.title}
          externalHref={project.href}
        />
        <main
          data-cs-main
          className="min-w-0 pt-16 pb-18 max-lg:pt-12 max-[480px]:pt-9 max-[480px]:pb-14"
        >
          <article className="relative mx-auto flex w-[min(calc(100%-112px),700px)] flex-col gap-9.5 max-[480px]:w-[min(calc(100%-40px),700px)]">
            <p
              data-morph="no"
              className={cn(
                caseStudyMono,
                "w-fit text-metadata leading-none font-medium tracking-[0.2em] text-ink-faint uppercase",
              )}
            >
              No. {String(project.number).padStart(2, "0")}
            </p>
            <h1
              data-morph="title"
              className={`${typeStyles.pageTitle} max-w-[16ch] text-balance text-ink`}
            >
              {project.title}
            </h1>
            <p className={`${typeStyles.lead} text-pretty text-ink-dim`}>
              {caseStudy.tagline}
            </p>
            <p
              className={cn(
                caseStudyMono,
                "text-metadata leading-normal font-normal text-ink-faint",
              )}
            >
              Case study by{" "}
              <Link
                href="/home/about"
                className="font-medium text-ink underline decoration-border-color underline-offset-4 transition-colors hover:text-accent"
              >
                {profile.name}
              </Link>
            </p>
            {caseStudy.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {caseStudy.tags.map((tag) => (
                  <li
                    key={tag}
                    className={cn(
                      caseStudyMono,
                      "rounded-full border border-border-color bg-surface px-2.5 py-1.75 text-metadata leading-none font-medium tracking-widest text-ink-faint uppercase",
                    )}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            {meta.length > 0 && (
              <dl className="grid grid-cols-3 gap-6 border-t border-border-color py-4.25 max-[480px]:grid-cols-1 max-[480px]:gap-3.5">
                {meta.map((item) => (
                  <div key={item.key} className="flex min-w-0 flex-col gap-2">
                    <dt className={caseStudyMetaKey}>{item.key}</dt>
                    <dd className={`${typeStyles.bodySmall} font-medium text-ink`}>
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {project.thumbnail ? (
              <figure
                data-morph="thumb"
                className={cn(caseStudyArtifact, "flex flex-col gap-2.5")}
              >
                <div
                  className={cn(
                    caseStudyDarkSurface,
                    "shadow-[0_18px_50px_-38px_rgb(0_0_0/0.7)]",
                  )}
                >
                  <Thumbnail
                    thumbnail={project.thumbnail}
                    className="rounded-none"
                  />
                </div>
                <figcaption
                  className={cn(caseStudyCaption, "max-[480px]:px-5")}
                >
                  {heroCaption}
                </figcaption>
              </figure>
            ) : caseStudy.hero.image ? (
              <figure
                data-morph="thumb"
                className={cn(caseStudyArtifact, "flex flex-col gap-2.5")}
              >
                <div
                  className={cn(
                    caseStudyDarkSurface,
                    "shadow-[0_18px_50px_-38px_rgb(0_0_0/0.7)]",
                  )}
                >
                  <Image
                    src={caseStudy.hero.image}
                    alt={project.title}
                    width={1400}
                    height={800}
                    sizes="(max-width: 1023px) 100vw, 700px"
                    className="block h-auto w-full object-cover"
                  />
                </div>
                <figcaption
                  className={cn(caseStudyCaption, "max-[480px]:px-5")}
                >
                  {heroCaption}
                </figcaption>
              </figure>
            ) : null}
            {caseStudy.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                data-cs-section
                className="scroll-mt-27 flex flex-col gap-5.5 pt-3"
              >
                <header
                  data-cs-heading
                  data-section-id={section.id}
                  className="flex flex-col gap-3.75"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        caseStudyMono,
                        "shrink-0 text-metadata leading-none font-semibold tracking-[0.16em] text-accent tabular-nums",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px w-full bg-border-color" aria-hidden />
                  </div>
                  <h2 className={`${typeStyles.sectionTitle} max-w-[24ch] text-balance text-ink`}>
                    {section.heading}
                  </h2>
                </header>
                <BlockRenderer blocks={section.blocks} />
              </section>
            ))}
            {caseStudy.sections.length > 0 && (
              <span
                data-cs-end
                className="pointer-events-none absolute bottom-0 left-0 h-px w-px"
                aria-hidden
              />
            )}
            {project.href && (
              <footer className="hidden flex-col gap-2 border-t border-border-color pt-5.5 max-lg:flex">
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    caseStudyMono,
                    "flex w-full items-center justify-between gap-3.5 rounded-[7px] border border-border-color bg-transparent px-2.75 py-2.5 text-[11px] font-medium text-ink",
                  )}
                >
                  <span>Live site</span>
                  <span className="text-accent" aria-hidden>
                    ↗
                  </span>
                </a>
              </footer>
            )}
          </article>
        </main>
      </div>
    </div>
  );
}
