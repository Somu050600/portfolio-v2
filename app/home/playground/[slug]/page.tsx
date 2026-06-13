import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeShell from "@/components/home/HomeShell";
import FluidSimExperiment, {
  PlaygroundBackLink,
} from "@/components/playground/FluidSimExperiment";
import TypeLab from "@/components/playground/TypeLab";
import {
  getExperiment,
  getLiveExperimentSlugs,
} from "@/lib/playground.config";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getLiveExperimentSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const exp = getExperiment(slug);
  if (!exp) return { title: "Playground — Somu" };
  return {
    title: `${exp.title} — Playground`,
    description: exp.description,
  };
}

export default async function PlaygroundExperimentPage({ params }: PageProps) {
  const { slug } = await params;
  const exp = getExperiment(slug);

  if (!exp || exp.status !== "live") notFound();

  return (
    <HomeShell>
      <main className="px-6 py-10 md:px-12 md:py-14 lg:px-16">
        <PlaygroundBackLink />
        <header className="mb-8 max-w-2xl">
          <h1 className="font-serif text-4xl font-light text-ink md:text-5xl">
            {exp.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-dim md:text-base">
            {exp.description}
          </p>
        </header>

        {slug === "type-lab" && <TypeLab />}
        {slug === "fluid-sim" && <FluidSimExperiment />}
      </main>
    </HomeShell>
  );
}
