"use client";

import Thumbnail from "@/components/thumbnail/Thumbnail";
import { componentAttrs } from "@/lib/build-mode";
import {
  clearEl,
  getBackMorphSlug,
  setBackMorphSlug,
  setMorphPending,
  tagEl,
} from "@/lib/morph";
import {
  PageTransitionContext,
  usePageTransition,
} from "@/lib/page-transition-context";
import {
  GRID_SCROLL_KEY,
  restoreScroll,
  saveScroll,
} from "@/lib/scroll-restore";
import type { Project, Status } from "@/lib/projects.config";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type MouseEvent,
} from "react";

// useLayoutEffect on the client, useEffect on the server, to avoid SSR warnings.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className="shrink-0 rounded-full border border-border-color bg-bg px-2 py-0.5 font-mono text-metadata tracking-wide text-ink-dim uppercase">
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
  | "thumbnail"
> & {
  featured?: boolean;
};

function CardContent({
  title,
  number,
  role,
  team,
  shipped,
  status,
  description,
  thumbnail,
  featured,
}: Pick<
  Project,
  | "title"
  | "number"
  | "role"
  | "team"
  | "shipped"
  | "status"
  | "description"
  | "thumbnail"
> & { featured: boolean }) {
  const num = String(number).padStart(2, "0");
  const statuses = Array.isArray(status) ? status : [status];

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <span
          className="size-3.25 rounded-full border border-border-color bg-bg shadow-[inset_0_1px_2px_color-mix(in_oklab,var(--ink)_18%,transparent)]"
          aria-hidden
        />
        <span
          data-morph="no"
          className="font-mono text-xs tracking-wide text-ink-dim uppercase"
        >
          No. {num}
        </span>
      </div>

      <div
        className={cn(
          "min-w-0 gap-4",
          featured
            ? "grid grid-cols-[1.05fr_1fr] @max-[640px]:grid-cols-1"
            : "flex flex-col",
        )}
      >
        {thumbnail && (
          <div
            data-morph="thumb"
            className="min-w-0 overflow-hidden rounded-2xl border border-border-color bg-thumb-bg"
          >
            <Thumbnail thumbnail={thumbnail} />
          </div>
        )}

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between gap-2.5">
            <h3
              data-morph="title"
              className="min-w-0 flex-1 truncate font-display text-card-title font-medium text-ink"
            >
              {title}
            </h3>
            <div className="flex shrink-0 items-center gap-3">
              {statuses.map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
          </div>
          <p className="line-clamp-2 min-h-[2.8em] font-body text-body-sm text-ink-dim">
            {description}
          </p>

          <div
            data-card-meta
            className="max-h-0 overflow-hidden transition-[max-height] duration-360 ease-[cubic-bezier(.22,.7,.25,1)] group-hover:max-h-37.5 motion-reduce:max-h-37.5"
          >
            <dl className="flex flex-col gap-2 border-t border-dotted border-border-color pt-3">
              <MetaRow label="Role" value={role} />
              <MetaRow label="Team" value={team} />
              <MetaRow label="Timeframe" value={shipped} />
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[78px_1fr] gap-4 text-xs leading-snug">
      <dt className="font-mono tracking-wide text-ink-dim uppercase">
        {label}
      </dt>
      <dd className="text-ink-dim">{value}</dd>
    </div>
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
    featured = false,
    ...contentProps
  } = props;

  const cover = usePageTransition();
  const router = useRouter();
  const { subscribeTransitionComplete } = useContext(PageTransitionContext);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const prefetched = useRef(false);
  const hasCaseStudy = !!caseStudy;
  const targetHref = external
    ? href
    : hasCaseStudy
      ? `/home/work/${slug}`
      : undefined;
  const inspect = componentAttrs(
    "ProjectIndexCard",
    note ??
      "Cream index card — hover reveals ROLE / TEAM / TIMEFRAME meta grid.",
  );

  const cardClass = cn(
    "group index-card flex flex-col gap-4 rounded-[20px] border border-border-color bg-surface p-5 text-ink motion-reduce:transition-none",
    "origin-[50%_40%] transition-[background-color,border-color,box-shadow] duration-300 ease-(--ease-out-soft) hover:border-accent hover:bg-elevated hover:shadow-[0_16px_36px_-28px_color-mix(in_oklab,var(--accent)_52%,transparent)]",
    targetHref && "cursor-pointer",
  );

  const cardStyle = {
    "--card-tilt": `${tilt}deg`,
    transform: "rotate(var(--card-tilt, 0deg))",
    order: props.number,
  } as React.CSSProperties;

  const handleClick = (e: MouseEvent) => {
    if (external || !targetHref) return;
    e.preventDefault();
    const willMorph =
      !!document.startViewTransition &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (willMorph) {
      tagEl(cardRef.current);
      setMorphPending("forward");
      // Remember where the grid was scrolled, so back-navigation can restore it
      // and the reverse morph lands on this card while it's on-screen.
      saveScroll(GRID_SCROLL_KEY, window.scrollY);
    }
    cover({ href: targetHref, originEl: cardRef.current, morph: willMorph });
  };

  // These cards aren't <Link>, so Next never prefetches them — the first morph
  // pays the route fetch (visible delay). Warm the case-study route on hover /
  // focus so it's cached by click time. External links can't be prefetched.
  const prefetch = () => {
    if (external || !targetHref || prefetched.current) return;
    prefetched.current = true;
    router.prefetch(targetHref);
  };

  // Backward morph: if a back-navigation targeted this card's slug, tag it on
  // mount (before the overlay resolves the nav → before the new snapshot) so
  // the browser pairs it with the outgoing case study.
  useIsoLayoutEffect(() => {
    if (!hasCaseStudy || getBackMorphSlug() !== slug) return;
    // Restore the grid scroll first (before the snapshot) so this card is in
    // the viewport for the reverse morph instead of below the fold.
    restoreScroll(GRID_SCROLL_KEY);
    const root = cardRef.current;
    tagEl(root);
    const unsub = subscribeTransitionComplete(() => {
      clearEl(root);
      setBackMorphSlug(null);
      unsub();
    });
    return () => unsub();
  }, [hasCaseStudy, slug, subscribeTransitionComplete]);

  if (targetHref) {
    return (
      <a
        ref={cardRef}
        href={targetHref}
        onClick={handleClick}
        onPointerEnter={prefetch}
        onFocus={prefetch}
        className={cardClass}
        style={cardStyle}
        {...inspect}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        <CardContent {...contentProps} featured={featured} />
      </a>
    );
  }

  return (
    <article
      className={cardClass}
      style={cardStyle}
      {...inspect}
    >
      <CardContent {...contentProps} featured={featured} />
    </article>
  );
}
