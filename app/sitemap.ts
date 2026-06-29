import type { MetadataRoute } from "next";
import { getCaseStudySlugs } from "@/lib/projects.config";
import { profile } from "@/lib/profile.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.url;
  const now = new Date();

  const routes = [
    "",
    "/home",
    "/home/experience",
    "/home/about",
    "/home/playground",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const caseStudies = getCaseStudySlugs().map((slug) => ({
    url: `${base}/home/work/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...routes, ...caseStudies];
}
