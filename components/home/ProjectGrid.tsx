import Link from "next/link";
import {
  categoryLabels,
  getMoreProjects,
  getProjectsByCategory,
} from "@/lib/projects.config";
import ProjectIndexCard from "./ProjectIndexCard";
import { componentAttrs } from "@/lib/build-mode";

export default function ProjectGrid() {
  const proProjects = getProjectsByCategory("pro");
  const creativeProjects = getProjectsByCategory("creative");
  const moreProjects = getMoreProjects();

  return (
    <div
      className="px-6 pb-10 md:px-12 md:pb-14 lg:px-16"
      {...componentAttrs(
        "ProjectGrid",
        "Two-column masonry grouped by Pro / Creative, plus compact More list.",
      )}
    >
      {(["pro", "creative"] as const).map((category) => {
        const items =
          category === "pro" ? proProjects : creativeProjects;
        if (items.length === 0) return null;

        // Split into two independent columns (sequential halves). Each column
        // stacks on its own, so a card's hover-reveal only nudges cards below
        // it in the SAME column — the other column never moves (no row-height
        // coupling, no column rebalance). On mobile the columns stack in order.
        const mid = Math.ceil(items.length / 2);
        const columns = [items.slice(0, mid), items.slice(mid)];

        return (
          <section
            key={category}
            className="mb-14"
            {...componentAttrs(
              `ProjectGrid.${category}`,
              category === "pro"
                ? "Shipped product work — design systems, compliance, SSO, perf."
                : "Creative experiments — WebGL, shaders, motion studies.",
            )}
          >
            <h2 className="mb-6 font-mono text-xs tracking-[0.2em] text-ink-dim uppercase">
              {categoryLabels[category]}
            </h2>
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              {columns.map((col, ci) => (
                <div key={ci} className="flex flex-1 flex-col gap-6">
                  {col.map((project) => (
                    <ProjectIndexCard
                      key={project.slug}
                      slug={project.slug}
                      title={project.title}
                      number={project.number}
                      role={project.role}
                      team={project.team}
                      shipped={project.shipped}
                      status={project.status}
                      description={project.description}
                      thumbnail={project.thumbnail}
                      tilt={project.tilt}
                      external={project.external}
                      href={project.href}
                      caseStudy={project.caseStudy}
                      note={project.note}
                    />
                  ))}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {moreProjects.length > 0 && (
        <section>
          <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-ink-dim uppercase">
            More
          </h2>
          <ul className="flex flex-col gap-2 border-t border-border-color pt-4">
            {moreProjects.map((project) => (
              <li key={project.slug}>
                {project.external && project.href ? (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-baseline justify-between gap-4 text-sm hover:text-ink"
                  >
                    <span className="text-ink-dim group-hover:text-ink">
                      {project.title}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-ink-faint">
                      {project.shipped}
                    </span>
                  </a>
                ) : project.caseStudy ? (
                  <Link
                    href={`/home/work/${project.slug}`}
                    className="group flex items-baseline justify-between gap-4 text-sm hover:text-ink"
                  >
                    <span className="text-ink-dim group-hover:text-ink">
                      {project.title}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-ink-faint">
                      {project.shipped}
                    </span>
                  </Link>
                ) : (
                  <span className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="text-ink-dim">{project.title}</span>
                    <span className="shrink-0 font-mono text-xs text-ink-faint">
                      {project.shipped}
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
