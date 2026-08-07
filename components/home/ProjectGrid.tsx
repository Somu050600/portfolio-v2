import { componentAttrs } from "@/lib/build-mode";
import {
  getIndexProjects,
  getMoreProjects,
  type Project,
} from "@/lib/projects.config";
import Link from "next/link";
import ProjectIndexCard from "./ProjectIndexCard";
import WorkListReserve from "./WorkListReserve";
import { arrangeWorkProjects } from "./work-card-layout";

function WorkCard({
  featured = false,
  project,
}: {
  featured?: boolean;
  project: Project;
}) {
  return <ProjectIndexCard {...project} featured={featured} />;
}

export default function ProjectGrid() {
  const { featured, columns } = arrangeWorkProjects(getIndexProjects());
  const moreProjects = getMoreProjects();

  return (
    <section
      className="@container mx-auto flex w-[min(calc(100%-2rem),940px)] flex-col gap-10 pb-14"
      {...componentAttrs(
        "ProjectGrid",
        "Numbered work list with one featured card and independent parity columns.",
      )}
    >
      {featured && (
        <WorkListReserve>
          <div className="flex flex-col gap-6" data-work-list>
            <WorkCard project={featured} featured />

            <div
              data-work-columns
              className="cols order-2 flex items-start gap-6 @max-[640px]:flex-col @max-[640px]:items-stretch"
            >
              {columns.map((column, columnIndex) => (
                <div
                  key={columnIndex}
                  className="flex min-w-0 flex-1 flex-col gap-6 @max-[640px]:contents"
                >
                  {column.map((project) => (
                    <WorkCard key={project.slug} project={project} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </WorkListReserve>
      )}

      {moreProjects.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-mono text-xs tracking-[0.2em] text-ink-dim uppercase">
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
                    className="group flex items-baseline justify-between gap-4 font-body text-sm hover:text-ink"
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
                    className="group flex items-baseline justify-between gap-4 font-body text-sm hover:text-ink"
                  >
                    <span className="text-ink-dim group-hover:text-ink">
                      {project.title}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-ink-faint">
                      {project.shipped}
                    </span>
                  </Link>
                ) : (
                  <span className="flex items-baseline justify-between gap-4 font-body text-sm">
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
    </section>
  );
}
