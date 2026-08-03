"use client";

import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLenis } from "lenis/react";
import { ArrowLeftIcon } from "lucide-react";
import { componentAttrs } from "@/lib/build-mode";
import { tagEl } from "@/lib/morph";
import {
  PageTransitionContext,
  usePageTransition,
} from "@/lib/page-transition-context";
import { cn } from "@/lib/utils";
import { caseStudyMono } from "./case-study-classes";
import {
  createSectionSelector,
  getSectionProgress,
  type ObservedSection,
} from "./case-study-navigation";

export type SectionLink = {
  id: string;
  label: string;
};

type CaseStudySidebarProps = {
  sections: SectionLink[];
  projectTitle: string;
  externalHref?: string;
};

export default function CaseStudySidebar({
  sections,
  projectTitle,
  externalHref,
}: CaseStudySidebarProps) {
  const cover = usePageTransition();
  const { subscribeTransitionComplete } = useContext(PageTransitionContext);
  const lenis = useLenis();
  const sidebarRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const orderedIds = useMemo(
    () => sections.map((section) => section.id),
    [sections],
  );
  const progress = getSectionProgress(activeId, orderedIds);

  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>("[data-cs-heading]"),
    ).filter((heading) => {
      const id = heading.dataset.sectionId;
      return id ? orderedIds.includes(id) : false;
    });

    if (headings.length === 0) return;
    const selector = createSectionSelector(orderedIds);

    const readActiveSection = () => {
      const positions: ObservedSection[] = headings.map((heading) => ({
        id: heading.dataset.sectionId ?? "",
        top: heading.getBoundingClientRect().top,
      }));

      setActiveId((current) =>
        selector.select(
          positions,
          current,
          window.innerHeight * 0.28,
        ),
      );
    };

    const observer = new IntersectionObserver(
      () => readActiveSection(),
      {
        rootMargin: "-24% 0px -66% 0px",
        threshold: [0, 1],
      },
    );

    headings.forEach((heading) => observer.observe(heading));
    const articleEnd = document.querySelector<HTMLElement>("[data-cs-end]");
    const endObserver = articleEnd
      ? new IntersectionObserver(
          ([entry]) => {
            selector.setArticleEndVisible(!!entry?.isIntersecting);
            readActiveSection();
          },
          { threshold: 0 },
        )
      : null;
    if (articleEnd) endObserver?.observe(articleEnd);

    return () => {
      observer.disconnect();
      endObserver?.disconnect();
    };
  }, [orderedIds]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeDisclosure = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    media.addEventListener("change", closeDisclosure);
    return () => media.removeEventListener("change", closeDisclosure);
  }, []);

  useLayoutEffect(() => {
    const aside = sidebarRef.current;
    if (!aside || !document.startViewTransition) return;
    aside.style.viewTransitionName = "cs-sidebar";
    const unsubscribe = subscribeTransitionComplete(() => {
      aside.style.viewTransitionName = "";
      unsubscribe();
    });
    return () => {
      aside.style.viewTransitionName = "";
      unsubscribe();
    };
  }, [subscribeTransitionComplete]);

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (lenis && !reduced) {
      lenis.scrollTo(target, { offset: -96 });
    } else {
      target.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    }

    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
    setOpen(false);
  };

  const scrollToTop = () => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (lenis && !reduced) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }

    history.replaceState(null, "", window.location.pathname);
    setOpen(false);
  };

  const navigateHome = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const willMorph =
      !!document.startViewTransition &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (willMorph) {
      const aside = sidebarRef.current;
      if (aside) aside.style.viewTransitionName = "cs-sidebar";
      tagEl(document.querySelector<HTMLElement>("[data-cs-main]"));
    }

    cover({
      href: "/home",
      originEl: event.currentTarget,
      direction: "backward",
      morph: willMorph,
    });
  };

  return (
    <aside
      ref={sidebarRef}
      data-cs-sidebar
      data-open={open ? "" : undefined}
      data-empty={sections.length === 0 ? "" : undefined}
      data-lenis-prevent
      {...componentAttrs(
        "CaseStudySidebar",
        "Sticky case-study contents with section progress and scroll spy.",
      )}
      className="group sticky top-0 left-0 z-20 h-screen w-66 self-start overflow-y-auto border-r border-border-color bg-sidebar-bg px-5.5 py-8 scrollbar-thin max-lg:z-50 max-lg:h-auto max-lg:w-full max-lg:overflow-visible max-lg:border-r-0 max-lg:border-b max-lg:bg-bg/95 max-lg:px-5 max-lg:py-3 max-lg:backdrop-blur-lg"
    >
      <div className="hidden min-h-9.5 items-center gap-2 max-lg:flex">
        <MobileCaseStudyBackLink onClick={navigateHome} />
        {sections.length > 0 ? (
          <button
            type="button"
            aria-controls="case-study-contents"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className={cn(
              caseStudyMono,
              "flex min-h-9.5 flex-1 items-center justify-between gap-4 px-2.5 text-[9.5px] leading-none font-semibold tracking-[0.18em] uppercase tabular-nums",
            )}
          >
            <span className="tracking-normal text-ink-faint">
              {progress.label}
            </span>
            <span className="text-ink-dim">
              Contents {open ? "▴" : "▾"}
            </span>
          </button>
        ) : (
          <p
            className={cn(
              caseStudyMono,
              "min-w-0 truncate px-2.5 text-[10px] leading-none font-medium tracking-[0.14em] text-ink-faint uppercase",
            )}
          >
            {projectTitle}
          </p>
        )}
      </div>

      <div
        id="case-study-contents"
        className="flex min-h-[calc(100vh-64px)] flex-col gap-6.5 max-lg:hidden max-lg:max-h-[calc(100vh-63px)] max-lg:min-h-0 max-lg:overflow-y-auto max-lg:px-2.5 max-lg:pt-5 max-lg:pb-2.5 max-lg:group-data-open:flex"
      >
        <div className="flex flex-col gap-3.25 max-lg:hidden">
          <p
            className={cn(
              caseStudyMono,
              "text-[10px] leading-[1.35] font-medium tracking-[0.14em] text-ink-faint uppercase",
            )}
          >
            {projectTitle}
          </p>
          <a
            href="/home"
            onClick={navigateHome}
            className={cn(
              caseStudyMono,
              "inline-flex w-fit items-center gap-2 text-[13.5px] leading-[1.4] font-medium text-ink",
            )}
          >
            <span aria-hidden>←</span>
            <span>Home</span>
          </a>
        </div>

        {sections.length > 0 && (
          <nav
            className="flex flex-col gap-2.5"
            aria-label="Case study sections"
          >
            <div
              className={cn(
                caseStudyMono,
                "flex items-center justify-between gap-4 px-2.5 text-[9.5px] leading-none font-semibold tracking-[0.18em] uppercase tabular-nums",
              )}
            >
              <span className="text-ink-dim">Contents</span>
              <span className="tracking-normal text-ink-faint">
                {progress.label}
              </span>
            </div>
            <ol className="flex flex-col gap-px">
              {sections.map((section, index) => {
                const isActive = section.id === activeId;
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      data-current={isActive ? "" : undefined}
                      aria-current={isActive ? "location" : undefined}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "grid w-full grid-cols-[24px_minmax(0,1fr)] items-baseline gap-2 rounded-[7px] px-2.5 py-2.25 text-left transition-[color,background-color,box-shadow] duration-150 motion-reduce:transition-none",
                        isActive
                          ? "bg-surface [box-shadow:inset_2px_0_0_var(--accent),0_1px_3px_rgb(0_0_0/0.08)]"
                          : "hover:bg-black/[0.035] dark:hover:bg-white/3",
                      )}
                    >
                      <span
                        className={cn(
                          caseStudyMono,
                          "text-[10.5px] leading-normal font-medium tabular-nums",
                          isActive
                            ? "font-semibold text-accent"
                            : "text-ink-faint",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "text-[15px] leading-[1.35] font-medium",
                          isActive
                            ? "font-semibold text-ink"
                            : "text-ink-dim",
                        )}
                      >
                        {section.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {externalHref && (
          <div className="flex flex-col gap-2 border-t border-border-color pt-5.5 max-lg:hidden">
            <a
              href={externalHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                caseStudyMono,
                "flex w-full items-center justify-between gap-3.5 rounded-[7px] border border-border-color bg-transparent px-2.75 py-2.5 text-[11px] font-medium text-ink",
              )}
            >
              <span>Live site</span>
              <span className="text-accent" aria-hidden>
                ↗
              </span>
            </a>
          </div>
        )}

        <button
          type="button"
          onClick={scrollToTop}
          className={cn(
            caseStudyMono,
            "mt-auto inline-flex w-fit items-center gap-2 text-[11px] font-medium text-ink-faint max-lg:hidden",
          )}
        >
          <span aria-hidden>↑</span>
          <span>Back to top</span>
        </button>
      </div>
    </aside>
  );
}

function MobileCaseStudyBackLink({
  onClick,
}: {
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      data-mobile-case-study-back
      href="/home"
      onClick={onClick}
      aria-label="Back to home"
      className={cn(
        caseStudyMono,
        "inline-flex size-9.5 shrink-0 items-center justify-center rounded-full border border-border-color bg-surface text-[15px] leading-none text-ink transition-[color,border-color,background-color] hover:border-accent hover:bg-elevated hover:text-accent",
      )}
    >
      <ArrowLeftIcon aria-hidden className="size-4" strokeWidth={1.75} />
    </a>
  );
}
