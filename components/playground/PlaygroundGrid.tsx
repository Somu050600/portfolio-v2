import Link from "next/link";
import { experiments } from "@/lib/playground.config";
import { componentAttrs } from "@/lib/build-mode";

export default function PlaygroundGrid() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2"
      {...componentAttrs(
        "PlaygroundGrid",
        "Experiment index. Every card opens a live, code-split demo.",
      )}
    >
      {experiments.map((exp) => (
        <Link
          key={exp.slug}
          href={`/home/playground/${exp.slug}`}
          className="group rounded-2xl border border-border-color bg-elevated p-5 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <h2 className="font-display text-card-title font-medium text-ink">
              {exp.title}
            </h2>
            <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 font-mono text-metadata tracking-wide text-ink uppercase">
              Live
            </span>
          </div>
          <p className="text-sm leading-relaxed text-ink-dim">
            {exp.description}
          </p>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {exp.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md bg-surface px-2 py-0.5 font-mono text-metadata text-ink-dim"
              >
                {tag}
              </li>
            ))}
          </ul>
          <span className="mt-4 inline-block font-mono text-xs text-ink-faint group-hover:text-ink">
            Open →
          </span>
        </Link>
      ))}
    </div>
  );
}
