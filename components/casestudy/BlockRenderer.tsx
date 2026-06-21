import type { Block } from "@/lib/projects.config";
import { accentCalloutStyles } from "@/lib/projects.config";
import { cn } from "@/lib/utils";
import Image from "next/image";
import DemoBlock from "./DemoBlock";

function TokenMismatchDiagram() {
  return (
    <figure className="not-prose">
      <div className="rounded-xl border border-border-color bg-surface overflow-hidden">
        <p className="px-4 pt-3 pb-2 font-mono text-[10px] tracking-[0.15em] text-ink-faint uppercase">
          How tokens got lost in translation
        </p>
        <div className="flex flex-col md:flex-row items-stretch gap-px bg-border-color px-0 pb-0">
          <div className="flex-1 bg-surface px-4 py-3">
            <p className="mb-1.5 font-mono text-[9px] tracking-[0.14em] text-ink-faint uppercase">
              Figma variable
            </p>
            <code className="font-mono text-sm text-ink">color/Blue</code>
          </div>
          <div className="flex items-center justify-center bg-surface px-3 py-1 text-ink-faint text-sm font-mono md:py-3">
            →
          </div>
          <div className="flex-1 bg-surface px-4 py-3">
            <p className="mb-1.5 font-mono text-[9px] tracking-[0.14em] text-ink-faint uppercase">
              LLM assumes
            </p>
            <code className="font-mono text-sm text-ink">
              Tailwind blue-500
            </code>
          </div>
          <div className="flex items-center justify-center bg-surface px-3 py-1 text-ink-faint text-sm font-mono md:py-3">
            →
          </div>
          <div className="flex-1 bg-surface px-4 py-3">
            <p className="mb-1.5 font-mono text-[9px] tracking-[0.14em] text-ink-faint uppercase">
              Generated code
            </p>
            <code className="block font-mono text-sm text-red-500 line-through opacity-70">
              bg-blue-500
            </code>
            <code className="block font-mono text-sm text-green-600 dark:text-green-400">
              bg-av-blue-500
            </code>
          </div>
        </div>
        <p className="px-4 py-2.5 font-mono text-[9px] tracking-wide text-ink-faint">
          Same name, different hex — no error thrown, wrong color rendered.
        </p>
      </div>
    </figure>
  );
}

function CompliancePipelineDiagram() {
  const steps = [
    { label: "Go Backend", sub: "generates report data", note: "" },
    { label: "JSON + Token", sub: "short-lived auth, expires fast", note: "unauth route" },
    { label: "Puppeteer", sub: "headless Chromium instance", note: "⚠ memory cost" },
    { label: "Next.js Page", sub: "getServerSideProps fetches + parses data", note: "" },
    { label: "@page Print", sub: "margins, counters, page-breaks, timestamp", note: "" },
    { label: "PDF", sub: "pixel-accurate, matches Figma layout", note: "✓ output" },
  ];
  return (
    <figure className="not-prose">
      <div className="rounded-xl border border-border-color bg-surface overflow-hidden px-5 py-4">
        <p className="mb-4 font-mono text-[10px] tracking-[0.15em] text-ink-faint uppercase">
          Report generation pipeline
        </p>
        <div className="flex flex-col">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-stretch gap-4">
              {/* Left: connector line + node dot */}
              <div className="flex flex-col items-center" style={{ width: 28 }}>
                <div className={cn(
                  "mt-1 h-2 w-2 shrink-0 rounded-full border-2",
                  i === steps.length - 1
                    ? "border-ink bg-ink"
                    : "border-ink-dim bg-surface",
                )} />
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-border-color my-1" />
                )}
              </div>
              {/* Right: label + sublabel */}
              <div className={cn("pb-4 flex-1 flex items-start justify-between gap-3", i === steps.length - 1 && "pb-0")}>
                <div>
                  <p className="font-mono text-sm font-medium text-ink leading-snug">{step.label}</p>
                  <p className="font-mono text-[11px] text-ink-faint mt-0.5">{step.sub}</p>
                </div>
                {step.note && (
                  <span className={cn(
                    "shrink-0 font-mono text-[10px] px-2 py-0.5 rounded-full border mt-0.5",
                    step.note.startsWith("⚠")
                      ? "text-orange-500 border-orange-500/30 bg-orange-500/10"
                      : "text-ink-faint border-border-color",
                  )}>
                    {step.note}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 font-mono text-[9px] tracking-wide text-ink-faint border-t border-border-color pt-3">
          Each request = one full Chromium instance. Cheap at low concurrency, fatal at scale.
        </p>
      </div>
    </figure>
  );
}

function DualRenderDiagram() {
  const browserRules = [
    "box-shadow on A4 cards",
    "report-header: opacity 0",
    "scrollable layout",
    "@page rules ignored",
  ];
  const printRules = [
    "box-shadow: none",
    "report-header: opacity 1",
    "A4 size, 0 margin",
    "timestamp in @bottom-right",
    "page-break-inside: avoid on rows",
  ];
  return (
    <figure className="not-prose">
      <div className="rounded-xl border border-border-color bg-surface overflow-hidden">
        <p className="px-4 pt-3 pb-3 font-mono text-[10px] tracking-[0.15em] text-ink-faint uppercase">
          Same HTML — two stylesheets
        </p>
        <div className="grid grid-cols-2 gap-px bg-border-color">
          <div className="bg-surface px-4 py-4">
            <p className="mb-2.5 font-mono text-[10px] tracking-[0.12em] text-ink-dim uppercase">
              Browser preview
            </p>
            <ul className="flex flex-col gap-1.5">
              {browserRules.map((r) => (
                <li
                  key={r}
                  className="flex items-start gap-2 font-mono text-[11px] text-ink-dim"
                >
                  <span className="mt-px text-ink-faint shrink-0">·</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface px-4 py-4">
            <p className="mb-2.5 font-mono text-[10px] tracking-[0.12em] text-ink-dim uppercase">
              <span className="text-ink">@media print</span> · PDF
            </p>
            <ul className="flex flex-col gap-1.5">
              {printRules.map((r) => (
                <li
                  key={r}
                  className="flex items-start gap-2 font-mono text-[11px] text-ink-dim"
                >
                  <span className="mt-px text-ink-faint shrink-0">·</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="px-4 py-2.5 font-mono text-[9px] tracking-wide text-ink-faint">
          The header is invisible on screen so it doesn&apos;t clutter the
          preview — Puppeteer reveals it only in print.
        </p>
      </div>
    </figure>
  );
}

function MemoryBlowupDiagram() {
  const bars = [
    {
      label: "CSV reports baseline",
      value: 250,
      max: 1100,
      color: "bg-ink-faint",
      note: "comfortable",
    },
    {
      label: "After PDF deploy",
      value: 850,
      max: 1100,
      color: "bg-accent",
      note: "700–900 MB",
    },
    {
      label: "Large client dataset",
      value: 1100,
      max: 1100,
      color: "bg-red-500",
      note: "pod ceiling hit",
    },
  ];
  return (
    <figure className="not-prose">
      <div className="rounded-xl border border-border-color bg-surface overflow-hidden">
        <p className="px-4 pt-3 pb-4 font-mono text-[10px] tracking-[0.15em] text-ink-faint uppercase">
          Report-generation pod memory
        </p>
        <div className="px-4 pb-2 flex flex-col gap-4">
          {bars.map((bar) => {
            const pct = Math.min((bar.value / bar.max) * 100, 100);
            return (
              <div key={bar.label}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="font-mono text-[11px] text-ink-dim">
                    {bar.label}
                  </span>
                  <span className="font-mono text-[11px] text-ink">
                    {bar.note}
                  </span>
                </div>
                <div className="relative h-6 w-full rounded bg-elevated overflow-hidden">
                  <div
                    className={cn("h-full rounded transition-all", bar.color)}
                    style={{ width: `${pct}%` }}
                  />
                  {bar.value >= bar.max && (
                    <div className="absolute inset-0 flex items-center justify-end pr-2">
                      <span className="font-mono text-[9px] text-white/80 tracking-wide uppercase">
                        pod died
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-2 pb-1">
            <div className="h-px flex-1 border-t border-dashed border-red-400/50" />
            <span className="font-mono text-[9px] text-red-400 tracking-wide">
              ~1 GB ceiling
            </span>
            <div className="h-px flex-1 border-t border-dashed border-red-400/50" />
          </div>
        </div>
      </div>
    </figure>
  );
}

function VtApproachesDiagram() {
  const fightIt = [
    "compute the new position in JS",
    "run a CSS transition on the element",
    "…but it fires during the View Transition",
    "the live element isn't painted — only its snapshot is",
  ];
  const nameIt = [
    "give the bar a view-transition-name",
    "render it inside the active item",
    "browser pairs old + new snapshots",
    "interpolates position with the page slide",
  ];
  return (
    <figure className="not-prose">
      <div className="overflow-hidden rounded-xl border border-border-color bg-surface">
        <p className="px-4 pt-3 pb-3 font-mono text-[10px] tracking-[0.15em] text-ink-faint uppercase">
          Two ways to move a bar across a navigation
        </p>
        <div className="grid grid-cols-1 gap-px bg-border-color sm:grid-cols-2">
          <div className="bg-surface px-4 py-4">
            <p className="mb-2.5 font-mono text-[10px] tracking-[0.12em] text-ink-dim uppercase">
              <span className="text-orange-500">Animate it yourself</span> · jumps
            </p>
            <ul className="flex flex-col gap-1.5">
              {fightIt.map((r) => (
                <li
                  key={r}
                  className="flex items-start gap-2 font-mono text-[11px] text-ink-dim"
                >
                  <span className="mt-px shrink-0 text-ink-faint">·</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface px-4 py-4">
            <p className="mb-2.5 font-mono text-[10px] tracking-[0.12em] text-ink-dim uppercase">
              <span className="text-ink">Name it, let the browser</span> · glides
            </p>
            <ul className="flex flex-col gap-1.5">
              {nameIt.map((r) => (
                <li
                  key={r}
                  className="flex items-start gap-2 font-mono text-[11px] text-ink-dim"
                >
                  <span className="mt-px shrink-0 text-ink-faint">·</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="px-4 py-2.5 font-mono text-[9px] tracking-wide text-ink-faint">
          Same goal. The left fights the transition; the right rides it.
        </p>
      </div>
    </figure>
  );
}

function ParagraphBlock({
  text,
  emphasis = [],
}: {
  text: string;
  emphasis?: string[];
}) {
  if (emphasis.length === 0) {
    return (
      <p className="text-base leading-relaxed text-ink-dim md:text-lg">
        {text}
      </p>
    );
  }

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  for (const phrase of emphasis) {
    const idx = remaining.indexOf(phrase);
    if (idx === -1) continue;
    if (idx > 0) parts.push(remaining.slice(0, idx));
    parts.push(
      <em key={key++} className="text-ink not-italic font-medium">
        {phrase}
      </em>,
    );
    remaining = remaining.slice(idx + phrase.length);
  }
  if (remaining) parts.push(remaining);

  return (
    <p className="text-base leading-relaxed text-ink-dim md:text-lg">{parts}</p>
  );
}

function BlockItem({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return <ParagraphBlock text={block.text} emphasis={block.emphasis} />;

    case "image":
      return (
        <figure>
          <div
            className="relative w-full overflow-hidden rounded-xl border border-border-color"
            style={{ height: block.height ?? 360 }}
          >
            <Image
              src={block.src}
              alt={block.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 720px"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-2 font-mono text-xs text-ink-faint">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "callout": {
      const styles = accentCalloutStyles[block.accent];
      return (
        <aside
          className={cn(
            "rounded-xl border px-5 py-4 text-sm leading-relaxed md:text-base",
            styles.bg,
            styles.border,
            styles.text,
          )}
        >
          {block.text}
        </aside>
      );
    }

    case "list":
      if (block.ordered) {
        return (
          <ol className="flex flex-col gap-6">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-4">
                {item.num && (
                  <span className="shrink-0 font-mono text-sm text-ink-faint">
                    {item.num}
                  </span>
                )}
                <div>
                  {item.title && (
                    <p className="mb-1 font-serif text-lg text-ink">
                      {item.title}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed text-ink-dim md:text-base">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="flex list-disc flex-col gap-2 pl-5 text-ink-dim">
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {item.title && (
                <span className="font-medium text-ink">{item.title}: </span>
              )}
              {item.text}
            </li>
          ))}
        </ul>
      );

    case "metrics":
      return (
        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {block.items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border-color bg-surface px-4 py-5"
            >
              <dt className="font-mono text-xs tracking-wide text-ink-faint uppercase">
                {item.label}
              </dt>
              <dd className="mt-1 font-serif text-3xl font-light text-ink">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      );

    case "diagram":
      if (block.kind === "token-mismatch") return <TokenMismatchDiagram />;
      if (block.kind === "compliance-pipeline")
        return <CompliancePipelineDiagram />;
      if (block.kind === "dual-render") return <DualRenderDiagram />;
      if (block.kind === "memory-blowup") return <MemoryBlowupDiagram />;
      if (block.kind === "vt-approaches") return <VtApproachesDiagram />;
      return null;

    case "demo":
      return <DemoBlock id={block.id} caption={block.caption} />;

    default:
      return null;
  }
}

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {blocks.map((block, i) => (
        <BlockItem key={i} block={block} />
      ))}
    </div>
  );
}
