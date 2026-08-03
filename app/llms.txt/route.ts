import { profile } from "@/lib/profile.config";
import { projects } from "@/lib/projects.config";

export const dynamic = "force-static";

/**
 * /llms.txt — an LLM/agent-friendly summary of the site (the emerging
 * llms.txt convention). Curated context + links so an agent gets the gist
 * without crawling. Generated from config so it never drifts.
 */
export function GET() {
  const base = profile.url;
  const caseStudies = projects.filter((p) => p.caseStudy);

  const md = [
    `# ${profile.name} (${profile.handle}) — Frontend Developer`,
    "",
    `> ${profile.tagline}`,
    "",
    profile.narrative,
    "",
    `${profile.bio} This is a personal portfolio at ${base}, built with Next.js, the View Transitions API, and GSAP.`,
    "",
    "## Case studies",
    ...caseStudies.map(
      (p) =>
        `- [${p.title}](${base}/home/work/${p.slug}): ${p.caseStudy?.tagline}`,
    ),
    "",
    "## Sections",
    `- [Work](${base}/home): selected professional and creative projects`,
    `- [Experience](${base}/home/experience): roles and timeline`,
    `- [About](${base}/home/about): background and approach`,
    `- [Playground](${base}/home/playground): interactive experiments`,
    "",
    "## Contact",
    `- GitHub: ${profile.contact.github}`,
    `- LinkedIn: ${profile.contact.linkedin}`,
    `- Email: ${profile.contact.email}`,
    `- Resume: ${profile.contact.resumeUrl}`,
    "",
  ].join("\n");

  return new Response(md, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
