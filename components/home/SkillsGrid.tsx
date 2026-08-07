"use client";

import {
  aboutSkillGroups,
  aboutSkills,
  type AboutSkillFilter,
} from "@/lib/about.config";
import { componentAttrs } from "@/lib/build-mode";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mono = "font-mono";

export function isSkillDimmed(
  activeGroup: string,
  skillGroup: string,
): boolean {
  return activeGroup !== "all" && activeGroup !== skillGroup;
}

export function shouldRevealAtomicNumbers(
  pinned: boolean,
  hovered: boolean,
): boolean {
  return pinned || hovered;
}

export default function SkillsGrid({
  showAtomicNumbers = false,
}: {
  showAtomicNumbers?: boolean;
}) {
  const [activeGroup, setActiveGroup] =
    useState<AboutSkillFilter>("all");

  return (
    <section
      aria-labelledby="about-skills-heading"
      className="flex min-w-0 flex-col gap-3.5"
      {...componentAttrs(
        "SkillsGrid",
        "Filterable 24-element periodic table of frontend skills.",
      )}
    >
      <div className="flex items-center gap-2.5">
        <h2
          id="about-skills-heading"
          className={cn(
            mono,
            "text-metadata leading-none font-normal tracking-[0.14em] text-ink-faint uppercase",
          )}
        >
          Skills
        </h2>
        <span className="h-px flex-1 bg-border-color" aria-hidden />
        <span
          className={cn(
            mono,
            "text-metadata leading-none font-normal tracking-[0.14em] text-ink-faint uppercase",
          )}
        >
          Filter ↓
        </span>
      </div>

      <div
        role="group"
        aria-label="Filter skills by group"
        className="flex flex-nowrap gap-1.75 overflow-x-auto pb-1 scrollbar-none min-[901px]:flex-wrap min-[901px]:overflow-visible min-[901px]:pb-0"
      >
        {aboutSkillGroups.map((group) => {
          const active = activeGroup === group.key;
          return (
            <button
              key={group.key}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveGroup(group.key)}
              className={cn(
                mono,
                "shrink-0 rounded-full border px-2.75 py-1.75 text-metadata leading-none font-medium tracking-[0.12em] transition-[color,border-color,background-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none",
                active
                  ? "border-accent bg-accent text-accent-fg"
                  : "border-border-color text-ink-dim hover:border-ink-faint hover:text-ink",
              )}
            >
              {group.label}
            </button>
          );
        })}
      </div>

      <ul className="grid grid-cols-4 gap-1.75 min-[901px]:gap-2 min-[1201px]:grid-cols-6">
        {aboutSkills.map((skill) => (
          <SkillTile
            key={skill.no}
            skill={skill}
            dimmed={isSkillDimmed(activeGroup, skill.group)}
            showAtomicNumber={showAtomicNumbers}
          />
        ))}
      </ul>
    </section>
  );
}

function SkillTile({
  skill,
  dimmed,
  showAtomicNumber,
}: {
  skill: (typeof aboutSkills)[number];
  dimmed: boolean;
  showAtomicNumber: boolean;
}) {
  return (
    <li
      data-skill-element
      data-group={skill.group}
      className={cn(
        "relative flex min-w-0 flex-col gap-1 rounded-[9px] border bg-transparent px-2 py-2.5 transition-[opacity,filter,border-color,background-color,transform] duration-300 ease-[cubic-bezier(.2,.7,.3,1)] hover:-translate-y-0.5 hover:border-accent/35 hover:bg-accent/5 motion-reduce:transition-none max-[900px]:hover:translate-y-0 min-[901px]:gap-1.25 min-[901px]:px-2.5 min-[901px]:pt-2.75 min-[901px]:pb-2.25",
        showAtomicNumber ? "border-accent/25" : "border-border-color",
        dimmed && "opacity-[.17] saturate-0",
      )}
    >
      <span
        className={cn(
          mono,
          "text-[15px] leading-none font-medium tracking-[-0.02em] text-ink min-[901px]:text-[17px]",
        )}
      >
        {skill.symbol}
      </span>
      <span
        className={cn(
          mono,
          "truncate text-[7.5px] leading-tight font-normal tracking-wider text-ink-faint min-[901px]:text-[8.5px] min-[901px]:tracking-[0.07em]",
        )}
        title={skill.name}
      >
        {skill.name}
      </span>
      <span
        className={cn(
          mono,
          "absolute top-1.5 right-1.75 text-[7.5px] leading-none font-normal transition-[opacity,color] duration-350 motion-reduce:transition-none",
          showAtomicNumber
            ? "text-accent opacity-100"
            : "text-ink-faint opacity-0",
        )}
        aria-hidden={!showAtomicNumber}
      >
        {skill.no}
      </span>
    </li>
  );
}
