import { skillGroups } from "@/lib/about.config";
import { componentAttrs } from "@/lib/build-mode";

export default function SkillsGrid() {
  return (
    <div
      className="grid gap-6 sm:grid-cols-2"
      {...componentAttrs(
        "SkillsGrid",
        "Grouped skill chips from the Resume stack.",
      )}
    >
      {skillGroups.map((group) => (
        <section
          key={group.label}
          className="rounded-xl border border-border-color bg-elevated p-5"
        >
          <h3 className="mb-3 font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase">
            {group.label}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <li
                key={item}
                className="rounded-md bg-surface px-2.5 py-1 text-sm text-ink-dim"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
