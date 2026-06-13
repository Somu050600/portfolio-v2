"use client";

import { useRef, type MouseEvent } from "react";
import type { Project, Status } from "@/lib/projects.config";
import { usePageTransition } from "@/lib/page-transition-context";
import { cn } from "@/lib/utils";
import { componentAttrs } from "@/lib/build-mode";
import CardPreview from "./CardPreview";

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className="shrink-0 rounded-full border border-border-color bg-bg px-2 py-0.5 font-mono text-[10px] tracking-wide text-ink-dim uppercase">
      {status}
    </span>
  );
}

type ProjectIndexCardProps = Pick<
  Project,
  | "title"
  | "number"
  | "role"
  | "team"
  | "shipped"
  | "status"
  | "description"
  | "tilt"
  | "external"
  | "href"
  | "slug"
  | "caseStudy"
  | "note"
> & {
  preview?: Project["preview"];
};

function CardContent({
  title,
  number,
  role,
  team,
  shipped,
  status,
  description,
  preview,
  slug,
}: Omit<ProjectIndexCardProps, "tilt" | "external" | "href" | "caseStudy">) {
  const num = String(number).padStart(2, "0");
  const statuses = Array.isArray(status) ? status : [status];

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <span
          className="h-[13px] w-[13px] rounded-full bg-bg shadow-[inset_0_1px_1.5px_rgba(36,36,36,0.35),inset_0_-0.5px_0.5px_rgba(255,255,255,0.4),0_0_0_1px_color-mix(in_oklab,var(--ink)_14%,transparent)]"
          aria-hidden
        />
        <span className="font-mono text-xs tracking-wide text-ink-dim uppercase">
          No. {num}
        </span>
      </div>

      {preview && (
        <CardPreview
          preview={preview}
          height={
            preview.kind === "image"
              ? preview.height ?? 228
              : preview.height ?? 228
          }
          cardId={slug}
        />
      )}

      <div className="mt-1 flex flex-col">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2.5">
            <h3 className="min-w-0 flex-1 truncate font-serif text-xl font-light text-ink">
              {title}
            </h3>
            <div className="flex shrink-0 items-center gap-3">
              {statuses.map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
          </div>
          {description && (
            <p className="text-xs leading-snug text-ink-dim">{description}</p>
          )}
        </div>

        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-[var(--ease-out-soft)] group-hover:grid-rows-[1fr] motion-reduce:grid-rows-[1fr]">
          <div className="min-h-0 overflow-hidden">
            <span
              className="mt-3 mb-3 block h-px w-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:opacity-100"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='1'><circle cx='0.5' cy='0.5' r='0.5' fill='%236e6553' opacity='0.45'/></svg>\")",
                backgroundRepeat: "repeat-x",
                backgroundSize: "8px 1px",
              }}
              aria-hidden
            />
            <dl className="flex translate-y-1 flex-col gap-2 pb-0.5 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100">
              <div className="grid grid-cols-[90px_1fr] gap-x-10 text-xs leading-snug">
                <dt className="font-mono tracking-wide text-ink-dim uppercase">
                  Role
                </dt>
                <dd className="text-ink-dim">{role}</dd>
              </div>
              <div className="grid grid-cols-[90px_1fr] gap-x-10 text-xs leading-snug">
                <dt className="font-mono tracking-wide text-ink-dim uppercase">
                  Team
                </dt>
                <dd className="text-ink-dim">{team}</dd>
              </div>
              <div className="grid grid-cols-[90px_1fr] gap-x-10 text-xs leading-snug">
                <dt className="font-mono tracking-wide text-ink-dim uppercase">
                  Timeframe
                </dt>
                <dd className="text-ink-dim">{shipped}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProjectIndexCard(props: ProjectIndexCardProps) {
  const {
    tilt = 0,
    external = false,
    href,
    slug,
    caseStudy,
    note,
    ...contentProps
  } = props;

  const cover = usePageTransition();
  const cardRef = useRef<HTMLAnchorElement>(null);
  const hasCaseStudy = !!caseStudy;
  const targetHref = external ? href : hasCaseStudy ? `/home/work/${slug}` : undefined;
  const inspect = componentAttrs(
    "ProjectIndexCard",
    note ?? "Cream index card — hover reveals ROLE / TEAM / TIMEFRAME meta grid.",
  );

  const cardClass = cn(
    "group index-card flex flex-col gap-2 rounded-2xl bg-elevated p-4 text-ink shadow-[0_0_4px_0_#999079] motion-reduce:transition-none",
    "origin-[50%_40%] transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-soft)]",
    "hover:-translate-y-0.5 hover:rotate-0 hover:shadow-[0_12px_22px_-14px_rgba(36,36,36,0.35),0_0_4px_0_#999079] motion-reduce:hover:translate-y-0",
    targetHref && "cursor-pointer",
  );

  const cardStyle = {
    "--card-tilt": `${tilt}deg`,
    transform: "rotate(var(--card-tilt, 0deg))",
  } as React.CSSProperties;

  const handleClick = (e: MouseEvent) => {
    if (external || !targetHref) return;
    e.preventDefault();
    cover({ href: targetHref, originEl: cardRef.current });
  };

  if (targetHref) {
    return (
      <a
        ref={cardRef}
        href={targetHref}
        onClick={handleClick}
        className={cardClass}
        style={cardStyle}
        {...inspect}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        <CardContent {...contentProps} slug={slug} />
      </a>
    );
  }

  return (
    <article className={cardClass} style={cardStyle} {...inspect}>
      <CardContent {...contentProps} slug={slug} />
    </article>
  );
}
