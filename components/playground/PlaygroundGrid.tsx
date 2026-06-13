import Link from "next/link";
import { experiments } from "@/lib/playground.config";
import { componentAttrs } from "@/lib/build-mode";
import { cn } from "@/lib/utils";

export default function PlaygroundGrid() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2"
      {...componentAttrs(
        "PlaygroundGrid",
        "Experiment index — live demos are code-split; stubs marked Soon.",
      )}
    >
      {experiments.map((exp) => {
        const live = exp.status === "live";
        const inner = (
          <>
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 className="font-serif text-xl font-light text-ink">
                {exp.title}
              </h2>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase",
                  live
                    ? "bg-accent-soft text-ink"
                    : "border border-border-color text-ink-faint",
                )}
              >
                {live ? "Live" : "Soon"}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-ink-dim">
              {exp.description}
            </p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {exp.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md bg-surface px-2 py-0.5 font-mono text-[10px] text-ink-dim"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </>
        );

        if (live) {
          return (
            <Link
              key={exp.slug}
              href={`/home/playground/${exp.slug}`}
              className="group rounded-2xl border border-border-color bg-elevated p-5 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none"
            >
              {inner}
              <span className="mt-4 inline-block font-mono text-xs text-ink-faint group-hover:text-ink">
                Open →
              </span>
            </Link>
          );
        }

        return (
          <article
            key={exp.slug}
            className="rounded-2xl border border-border-color bg-surface/50 p-5 opacity-80"
          >
            {inner}
          </article>
        );
      })}
    </div>
  );
}
