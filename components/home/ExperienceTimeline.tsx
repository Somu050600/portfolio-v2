"use client";

import { useEffect, useRef } from "react";
import { roles, type Role } from "@/lib/experience.config";
import { componentAttrs } from "@/lib/build-mode";
import { cn } from "@/lib/utils";
import Counter from "./Counter";
import { useReducedMotion } from "@/lib/use-reduced-motion";

function IntegrationRow({ names }: { names: string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Integrations">
      {names.map((name) => (
        <li
          key={name}
          className="rounded-full border border-border-color bg-bg px-2.5 py-1 font-mono text-[10px] tracking-wide text-ink-dim uppercase"
        >
          {name}
        </li>
      ))}
    </ul>
  );
}

function RoleCard({ role, index }: { role: Role; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.setAttribute("data-visible", "");
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <article
      ref={ref}
      {...componentAttrs(
        `ExperienceTimeline.${role.company}`,
        `${role.role} at ${role.company} — ${role.start} to ${role.end}.`,
      )}
      className={cn(
        "relative pl-8 opacity-0 translate-y-6 transition-[opacity,transform] duration-700 ease-(--ease-out-soft) motion-reduce:translate-y-0 motion-reduce:opacity-100",
        "data-visible:opacity-100 data-visible:translate-y-0",
        index % 2 === 1 && "md:translate-x-4 md:data-visible:translate-x-4",
      )}
      style={{ transitionDelay: reducedMotion ? "0ms" : `${index * 80}ms` }}
    >
      <span
        className="absolute top-2 left-0 h-3 w-3 rounded-full border-2 border-accent bg-bg"
        aria-hidden
      />
      <header className="mb-3">
        <p className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">
          {role.start} — {role.end} · {role.location}
        </p>
        <h2 className="mt-1 font-serif text-2xl font-light text-ink">
          {role.role}
        </h2>
        <p className="mt-0.5 font-mono text-sm text-ink-dim">{role.company}</p>
      </header>

      <ul className="flex flex-col gap-2 text-sm leading-relaxed text-ink-dim">
        {role.highlights.map((h) => (
          <li key={h} className="flex gap-2">
            <span className="text-ink-faint" aria-hidden>
              —
            </span>
            <span>{h}</span>
          </li>
        ))}
      </ul>

      {role.integrations && role.integrations.length > 0 && (
        <IntegrationRow names={role.integrations} />
      )}

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {role.metrics.map((m) => (
          <Counter key={m.label} value={m.value} label={m.label} />
        ))}
      </div>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {role.stack.map((tech) => (
          <li
            key={tech}
            className="rounded-md bg-surface px-2 py-0.5 font-mono text-[10px] text-ink-dim"
          >
            {tech}
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function ExperienceTimeline() {
  return (
    <div
      className="relative"
      {...componentAttrs(
        "ExperienceTimeline",
        "Vertical résumé timeline — scroll-staggered roles with metric counters.",
      )}
    >
      <span
        className="absolute top-0 bottom-0 left-[5px] w-px bg-border-color"
        aria-hidden
      />
      <div className="flex flex-col gap-14">
        {roles.map((role, i) => (
          <RoleCard key={role.company} role={role} index={i} />
        ))}
      </div>
    </div>
  );
}
