"use client";

import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { PageTransitionContext, usePageTransition } from "@/lib/page-transition-context";
import { componentAttrs } from "@/lib/build-mode";
import { cn } from "@/lib/utils";
import { tagEl } from "@/lib/morph";

export type SectionLink = {
  id: string;
  label: string;
};

type CaseStudySidebarProps = {
  sections: SectionLink[];
  projectTitle: string;
};

export default function CaseStudySidebar({
  sections,
  projectTitle,
}: CaseStudySidebarProps) {
  const cover = usePageTransition();
  const { subscribeTransitionComplete } = useContext(PageTransitionContext);
  const lenis = useLenis();
  const homeRef = useRef<HTMLAnchorElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tocRef = useRef<HTMLElement>(null);

  const movePillTo = useCallback((item: HTMLElement | null) => {
    const pill = pillRef.current;
    const list = listRef.current;
    if (!pill || !list) return;
    if (!item) {
      pill.style.opacity = "0";
      return;
    }
    const itemRect = item.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    pill.style.transform = `translateY(${itemRect.top - listRect.top}px)`;
    pill.style.height = `${itemRect.height}px`;
    pill.style.opacity = "1";
  }, []);

  const itemForId = useCallback(
    (id: string) =>
      listRef.current?.querySelector<HTMLElement>(
        `[data-cs-toc-item][data-section="${id}"]`,
      ) ?? null,
    [],
  );

  // Scroll-spy
  useEffect(() => {
    const sectionEls = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);

    if (sectionEls.length === 0) return;

    let scheduled = false;
    const updateActive = () => {
      scheduled = false;
      const line = window.innerHeight * 0.28;
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;

      if (nearBottom) {
        const last = sectionEls[sectionEls.length - 1];
        if (last) setActiveId(last.id);
        return;
      }

      let chosen: string | null = null;
      for (const sec of sectionEls) {
        if (sec.getBoundingClientRect().top <= line) {
          chosen = sec.id;
        } else {
          break;
        }
      }
      if (!chosen) chosen = sectionEls[0]?.id ?? null;
      if (chosen) setActiveId(chosen);
    };

    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      if (document.visibilityState === "visible") {
        requestAnimationFrame(updateActive);
      } else {
        setTimeout(updateActive, 16);
      }
    };

    window.addEventListener("scroll", schedule, { passive: true });
    updateActive();
    const t = setTimeout(updateActive, 60);

    return () => {
      window.removeEventListener("scroll", schedule);
      clearTimeout(t);
    };
  }, [sections]);

  useEffect(() => {
    movePillTo(itemForId(activeId));
  }, [activeId, movePillTo, itemForId]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const onResize = () => movePillTo(itemForId(activeId));
    window.addEventListener("resize", onResize);

    const items = list.querySelectorAll<HTMLElement>("[data-cs-toc-item]");
    const onEnter = (e: Event) => movePillTo(e.currentTarget as HTMLElement);
    const onLeave = () => movePillTo(itemForId(activeId));

    items.forEach((item) => item.addEventListener("mouseenter", onEnter));
    list.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("resize", onResize);
      items.forEach((item) => item.removeEventListener("mouseenter", onEnter));
      list.removeEventListener("mouseleave", onLeave);
    };
  }, [activeId, movePillTo, itemForId]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Assign cs-sidebar view-transition-name so the VT can animate it:
  //  - forward nav: new-page snapshot captures sidebar → ::view-transition-new(cs-sidebar) slides in
  //  - back nav: home click re-applies the name before cover() → ::view-transition-old(cs-sidebar) slides out
  // Cleared after each transition so theme-toggle/other VTs don't capture it separately.
  useLayoutEffect(() => {
    const aside = sidebarRef.current;
    if (!aside || !document.startViewTransition) return;
    aside.style.viewTransitionName = "cs-sidebar";
    const unsub = subscribeTransitionComplete(() => {
      aside.style.viewTransitionName = "";
      unsub();
    });
    return () => {
      aside.style.viewTransitionName = "";
      unsub();
    };
  }, [subscribeTransitionComplete]);

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (lenis && !reduced) {
      lenis.scrollTo(target, { offset: -112, immediate: reduced });
    } else {
      target.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    }

    history.replaceState(null, "", `#${id}`);
    setOpen(false);
  };

  const scrollToTop = () => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (lenis && !reduced) {
      lenis.scrollTo(0, { immediate: reduced });
    } else {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }

    history.replaceState(null, "", " ");
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open table of contents"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          "fixed top-1/2 left-0 z-40 flex -translate-y-1/2 items-center gap-1 rounded-r-xl bg-surface px-2 py-3.5 shadow-md lg:hidden",
          open && "pointer-events-none opacity-0",
        )}
      >
        <span className="flex flex-col gap-[3px]" aria-hidden>
          <span className="block h-[3px] w-[3px] rounded-full bg-ink-dim" />
          <span className="block h-[3px] w-[3px] rounded-full bg-ink-dim" />
          <span className="block h-[3px] w-[3px] rounded-full bg-ink-dim" />
        </span>
        <span className="font-mono text-base" aria-hidden>
          ›
        </span>
      </button>

      <button
        type="button"
        aria-label="Close navigation"
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-ink/35 transition-opacity lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        ref={sidebarRef}
        data-cs-sidebar
        data-open={open ? "" : undefined}
        data-lenis-prevent
        {...componentAttrs(
          "CaseStudySidebar",
          "Scroll-spy case study TOC — replaces home sidebar on /work/*.",
        )}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(85vw,300px)] flex-col overflow-y-auto border-r border-border-color bg-bg px-6 py-8 motion-reduce:transition-none",
          "transition-transform duration-300 ease-(--ease-out-soft)",
          open ? "translate-x-0 shadow-xl" : "-translate-x-full",
          "lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-[300px] lg:translate-x-0",
        )}
      >
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full text-xl text-ink-dim hover:bg-surface lg:hidden"
        >
          ×
        </button>

        <p className="mb-6 font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase">
          {projectTitle}
        </p>

        <a
          ref={homeRef}
          href="/home"
          onClick={(e) => {
            e.preventDefault();
            const willMorph =
              !!document.startViewTransition &&
              !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (willMorph) {
              // Re-apply cs-sidebar name (was cleared after forward VT)
              // so the back VT snapshot captures it for the slide-out animation.
              const aside = sidebarRef.current;
              if (aside) aside.style.viewTransitionName = "cs-sidebar";
              tagEl(document.querySelector<HTMLElement>("[data-cs-main]"));
            }
            cover({
              href: "/home",
              originEl: homeRef.current,
              direction: "backward",
              morph: willMorph,
            });
          }}
          className="group mb-8 inline-flex items-center gap-2 font-mono text-sm text-ink-dim hover:text-ink"
        >
          <span className="transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none">
            ←
          </span>
          Home
        </a>

        <nav ref={tocRef} aria-label="Case study sections" data-cs-toc>
          <p className="mb-3 font-mono text-[11px] tracking-[0.18em] text-ink-dim uppercase">
            Table of Contents
          </p>
          <div className="relative">
            <span
              ref={pillRef}
              data-cs-toc-pill
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 rounded-lg bg-surface opacity-0 motion-reduce:transition-none"
              style={{
                transition:
                  "transform 280ms var(--ease-out-soft), height 280ms var(--ease-out-soft), opacity 200ms var(--ease-out-soft)",
              }}
            />
            <ul
              ref={listRef}
              data-cs-toc-list
              className="relative flex flex-col gap-0.5"
            >
              {sections.map((section, idx) => {
                const label = `${String(idx + 1).padStart(2, "0")}. ${section.label}`;
                const isActive = section.id === activeId;
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      data-cs-toc-item
                      data-section={section.id}
                      data-current={isActive ? "" : undefined}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "w-full rounded-lg px-3 py-2.5 text-left font-mono text-[13px] tracking-wide transition-colors",
                        isActive ? "text-ink" : "text-ink-dim hover:text-ink",
                      )}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <button
          type="button"
          data-cs-back-to-top
          onClick={scrollToTop}
          className="group mt-auto inline-flex items-center gap-2 pt-10 font-mono text-sm text-ink-dim hover:text-ink"
        >
          <span className="transition-transform group-hover:-translate-y-0.5 motion-reduce:transition-none">
            ↑
          </span>
          Back to top
        </button>
      </aside>
    </>
  );
}
