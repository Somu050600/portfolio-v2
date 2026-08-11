import type { Block } from "@/lib/projects.config";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  caseStudyArtifact,
  caseStudyCaption,
  caseStudyDarkSurface,
  caseStudyMetaKey,
  caseStudyMono,
  caseStudyProse,
} from "./case-study-classes";
import DemoBlock from "./DemoBlock";
import VTLab from "./VTLab";

function TokenMismatchDiagram() {
  return (
    <figure className={cn("not-prose", caseStudyArtifact)}>
      <div className="rounded-xl border border-border-color bg-surface overflow-hidden">
        <p className="px-4 pt-3 pb-2 font-mono text-metadata tracking-[0.15em] text-ink-faint uppercase">
          How tokens got lost in translation
        </p>
        <div className="flex flex-col md:flex-row items-stretch gap-px bg-border-color px-0 pb-0">
          <div className="flex-1 bg-surface px-4 py-3">
            <p className="mb-1.5 font-mono text-metadata tracking-[0.14em] text-ink-faint uppercase">
              Figma variable
            </p>
            <code className="font-mono text-sm text-ink">color/Blue</code>
          </div>
          <div className="flex items-center justify-center bg-surface px-3 py-1 text-ink-faint text-sm font-mono md:py-3">
            →
          </div>
          <div className="flex-1 bg-surface px-4 py-3">
            <p className="mb-1.5 font-mono text-metadata tracking-[0.14em] text-ink-faint uppercase">
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
            <p className="mb-1.5 font-mono text-metadata tracking-[0.14em] text-ink-faint uppercase">
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
        <p className="px-4 py-2.5 font-mono text-metadata tracking-wide text-ink-faint">
          Same name, different hex. No error thrown, wrong color rendered.
        </p>
      </div>
    </figure>
  );
}

function CompliancePipelineDiagram() {
  const steps = [
    { label: "Async report job", sub: "Generating · Completed · Failed", note: "non-blocking UX" },
    { label: "Go backend", sub: "prepares data + short-lived token", note: "backend-owned" },
    { label: "Go + chromedp", sub: "drives headless Chromium", note: "⚠ heavy workload" },
    { label: "Next.js SSR page", sub: "getServerSideProps fetches + renders", note: "frontend-owned" },
    { label: "PrintToPDF", sub: "A4 CSS, page breaks, counters, headers", note: "" },
    { label: "Stored PDF", sub: "report list + optional email / Slack", note: "✓ completed" },
  ];
  return (
    <figure className={cn("not-prose", caseStudyArtifact)}>
      <div className="rounded-xl border border-border-color bg-surface overflow-hidden px-5 py-4">
        <p className="mb-4 font-mono text-metadata tracking-[0.15em] text-ink-faint uppercase">
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
                    "shrink-0 font-mono text-metadata px-2 py-0.5 rounded-full border mt-0.5",
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
        <p className="mt-2 border-t border-border-color pt-3 font-mono text-metadata tracking-wide text-ink-faint">
          Chromium was reused, but every report still added a heavy page and
          paged-layout workload. Exact page/context lifecycle was not verified.
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
    <figure className={cn("not-prose", caseStudyArtifact)}>
      <div className="rounded-xl border border-border-color bg-surface overflow-hidden">
        <p className="px-4 pt-3 pb-3 font-mono text-metadata tracking-[0.15em] text-ink-faint uppercase">
          Same HTML, two stylesheets
        </p>
        <div className="grid grid-cols-2 gap-px bg-border-color">
          <div className="bg-surface px-4 py-4">
            <p className="mb-2.5 font-mono text-metadata tracking-[0.12em] text-ink-dim uppercase">
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
            <p className="mb-2.5 font-mono text-metadata tracking-[0.12em] text-ink-dim uppercase">
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
        <p className="px-4 py-2.5 font-mono text-metadata tracking-wide text-ink-faint">
          The header is invisible on screen so it doesn&apos;t clutter the
          preview. The Chromium print pipeline reveals it only in print.
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
      note: "~700–900 MB",
    },
    {
      label: "Large client dataset",
      value: 1100,
      max: 1100,
      color: "bg-red-500",
      note: "~1 GB ceiling hit",
    },
  ];
  return (
    <figure className={cn("not-prose", caseStudyArtifact)}>
      <div className="rounded-xl border border-border-color bg-surface overflow-hidden">
        <p className="px-4 pt-3 pb-4 font-mono text-metadata tracking-[0.15em] text-ink-faint uppercase">
          Remembered report-generation pod memory
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
                      <span className="font-mono text-metadata tracking-wide text-white/80 uppercase">
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
            <span className="font-mono text-metadata tracking-wide text-red-400">
              Approximate figures · Exact mix unproven
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
    "the live element isn't painted, only its snapshot is",
  ];
  const nameIt = [
    "give the bar a view-transition-name",
    "render it inside the active item",
    "browser pairs old + new snapshots",
    "interpolates position with the page slide",
  ];
  return (
    <figure className={cn("not-prose", caseStudyArtifact)}>
      <div className="overflow-hidden rounded-xl border border-border-color bg-surface">
        <p className="px-4 pt-3 pb-3 font-mono text-metadata tracking-[0.15em] text-ink-faint uppercase">
          Two ways to move a bar across a navigation
        </p>
        <div className="grid grid-cols-1 gap-px bg-border-color sm:grid-cols-2">
          <div className="bg-surface px-4 py-4">
            <p className="mb-2.5 font-mono text-metadata tracking-[0.12em] text-ink-dim uppercase">
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
            <p className="mb-2.5 font-mono text-metadata tracking-[0.12em] text-ink-dim uppercase">
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
        <p className="px-4 py-2.5 font-mono text-metadata tracking-wide text-ink-faint">
          Same goal. The left fights the transition; the right rides it.
        </p>
      </div>
    </figure>
  );
}

function PhotographyPipelineDiagram() {
  const steps = [
    ["Read-only source audit", "22 images · SHA-256 · EXIF/XMP"],
    ["Duplicate + privacy review", "2 likely groups · 7 GPS-bearing sources"],
    ["Raster / DNG / panorama", "separate, explicit processing branches"],
    ["Orientation + sRGB", "no upscaling · metadata stripped"],
    ["Role-based derivatives", "thumb · grid · viewer · panorama"],
    ["Typed manifest", "stable IDs · safe EXIF · draft alt text"],
    ["Gallery + viewer", "context-sized delivery with measured timing"],
  ];
  return (
    <figure className={cn("not-prose", caseStudyArtifact)} data-cs-artifact>
      <div className="overflow-hidden rounded-xl border border-border-color bg-surface p-4">
        <p className="mb-4 font-mono text-metadata tracking-[0.15em] text-ink-faint uppercase">
          Photography asset pipeline
        </p>
        <ol className="grid gap-2 sm:grid-cols-2">
          {steps.map(([label, detail], index) => (
            <li
              key={label}
              className={cn(
                "flex min-w-0 gap-3 rounded-lg border border-border-color bg-elevated p-3",
                index === steps.length - 1 && "sm:col-span-2",
              )}
            >
              <span className="font-mono text-metadata text-ink-faint tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <b className="text-sm font-medium text-ink">{label}</b>
                <small className="font-mono text-metadata leading-4 text-ink-dim">
                  {detail}
                </small>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}

function PhotoDeliveryDiagram() {
  const roles = [
    {
      label: "Contact sheet",
      asset: "Grid WebP",
      behavior: "1 eager LCP candidate · 21 lazy images",
    },
    {
      label: "Full-screen viewer",
      asset: "Active viewer WebP",
      behavior: "Active viewer only · adjacent prefetch after decode",
    },
    {
      label: "360° photograph",
      asset: "Poster → panorama JPEG",
      behavior: "Three.js and 8K equirectangular asset load on open",
    },
  ];
  return (
    <figure className={cn("not-prose", caseStudyArtifact)} data-cs-artifact>
      <div className="overflow-hidden rounded-xl border border-border-color bg-surface">
        <p className="border-b border-border-color px-4 py-3 font-mono text-metadata tracking-[0.15em] text-ink-faint uppercase">
          One photograph, three delivery contexts
        </p>
        <div className="grid gap-px bg-border-color md:grid-cols-3">
          {roles.map((role) => (
            <div key={role.label} className="flex flex-col gap-2 bg-surface p-4">
              <b className="text-sm font-medium text-ink">{role.label}</b>
              <code className="w-fit rounded bg-elevated px-2 py-1 font-mono text-metadata text-ink-dim">
                {role.asset}
              </code>
              <p className="font-mono text-metadata leading-4 text-ink-faint">
                {role.behavior}
              </p>
            </div>
          ))}
        </div>
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
    return <p className={caseStudyProse}>{text}</p>;
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

  return <p className={caseStudyProse}>{parts}</p>;
}

function BlockItem({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return <ParagraphBlock text={block.text} emphasis={block.emphasis} />;

    case "image":
      return (
        <figure
          className={cn(
            "flex min-w-0 flex-col gap-2.5",
            caseStudyArtifact,
          )}
        >
          <div
            className={cn(
              "relative w-full shadow-[0_18px_50px_-38px_rgb(0_0_0/0.7)]",
              caseStudyDarkSurface,
            )}
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
            <figcaption
              className={cn(caseStudyCaption, "max-[480px]:px-5")}
            >
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "callout":
      return (
        <blockquote className="border-l-2 border-accent py-0.5 pl-4.5 text-lg leading-[1.55] font-medium tracking-[-0.02em] text-ink text-pretty">
          {block.text}
        </blockquote>
      );

    case "list":
      if (block.ordered) {
        return (
          <ol className="flex flex-col gap-4 text-ink-dim">
            {block.items.map((item, i) => (
              <li
                key={i}
                className="grid grid-cols-[32px_minmax(0,1fr)] gap-3"
              >
                <span
                  className={cn(
                    caseStudyMono,
                    "text-metadata leading-normal font-medium text-ink-faint tabular-nums",
                  )}
                >
                  {item.num ?? String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-1.25">
                  {item.title && (
                    <p className="text-base leading-[1.35] font-semibold text-ink">
                      {item.title}
                    </p>
                  )}
                  <p className={caseStudyProse}>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="flex list-disc flex-col gap-4 pl-5 text-ink-dim">
          {block.items.map((item, i) => (
            <li key={i} className={caseStudyProse}>
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
        <dl
          className={cn(
            "grid grid-cols-3 gap-2.5 max-[480px]:grid-cols-1",
            caseStudyArtifact,
          )}
        >
          {block.items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col-reverse gap-2 rounded-lg border border-border-color bg-surface p-4"
            >
              <dt className={caseStudyMetaKey}>{item.label}</dt>
              <dd className="text-[25px] leading-[1.2] font-semibold tracking-[-0.03em] text-ink">
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
      if (block.kind === "photography-pipeline")
        return <PhotographyPipelineDiagram />;
      if (block.kind === "photo-delivery") return <PhotoDeliveryDiagram />;
      return null;

    case "demo":
      return <DemoBlock id={block.id} caption={block.caption} />;

    case "vtlab":
      return <VTLab />;

    default:
      return null;
  }
}

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-5.5">
      {blocks.map((block, i) => (
        <BlockItem key={i} block={block} />
      ))}
    </div>
  );
}
