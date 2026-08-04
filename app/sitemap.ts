import type { MetadataRoute } from "next";
import { getLiveExperimentSlugs } from "@/lib/playground.config";
import { getCaseStudySlugs } from "@/lib/projects.config";
import { profile } from "@/lib/profile.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.url;
  const routes = [
    "",
    "/home",
    "/home/experience",
    "/home/about",
    "/home/playground",
  ].map((path) => ({
    url: new URL(path || "/", base).toString(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const caseStudies = getCaseStudySlugs().map((slug) => ({
    url: `${base}/home/work/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const playgroundExperiments = getLiveExperimentSlugs().map((slug) => ({
    url: `${base}/home/playground/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...routes, ...playgroundExperiments, ...caseStudies];
}
