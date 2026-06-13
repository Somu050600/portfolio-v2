"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { homeNavItems, type HomeNavKey } from "@/lib/home.config";
import { componentAttrs } from "@/lib/build-mode";
import { cn } from "@/lib/utils";

function resolveActiveKey(pathname: string): HomeNavKey {
  if (pathname.startsWith("/home/work")) return "work";
  if (pathname.startsWith("/home/experience")) return "experience";
  if (pathname.startsWith("/home/about")) return "about";
  if (pathname.startsWith("/home/playground")) return "playground";
  return "work";
}

export default function TableOfContents() {
  const pathname = usePathname();
  const active = resolveActiveKey(pathname);
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

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

  const activeItem = useCallback(() => {
    const list = listRef.current;
    if (!list) return null;
    return list.querySelector<HTMLElement>(
      `[data-toc-item][data-key="${active}"]`,
    );
  }, [active]);

  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;

    pill.style.transition = "none";
    requestAnimationFrame(() => {
      movePillTo(activeItem());
      requestAnimationFrame(() => {
        pill.style.transition = "";
      });
    });
  }, [active, movePillTo, activeItem]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const onResize = () => movePillTo(activeItem());
    window.addEventListener("resize", onResize);

    const items = list.querySelectorAll<HTMLElement>("[data-toc-item]");
    const onEnter = (e: Event) => movePillTo(e.currentTarget as HTMLElement);
    const onLeave = () => movePillTo(activeItem());

    items.forEach((item) => item.addEventListener("mouseenter", onEnter));
    list.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("resize", onResize);
      items.forEach((item) => item.removeEventListener("mouseenter", onEnter));
      list.removeEventListener("mouseleave", onLeave);
    };
  }, [active, movePillTo, activeItem]);

  return (
    <nav
      aria-label="Site sections"
      data-toc
      {...componentAttrs(
        "TableOfContents",
        "Numbered section nav with sliding active pill — mirrors Megan's TOC pattern.",
      )}
    >
      <p className="mb-3 font-mono text-[11px] tracking-[0.18em] text-ink-dim uppercase">
        Explore
      </p>
      <div className="relative">
        <span
          ref={pillRef}
          data-toc-pill
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 rounded-lg bg-surface opacity-0 motion-reduce:transition-none"
          style={{
            transition:
              "transform 280ms var(--ease-out-soft), height 280ms var(--ease-out-soft), opacity 200ms var(--ease-out-soft)",
          }}
        />
        <ul ref={listRef} data-toc-list className="relative flex flex-col gap-0.5">
          {homeNavItems.map((item) => {
            const isActive = item.key === active;
            return (
              <li key={item.key} className="relative">
                <Link
                  href={item.href}
                  data-toc-item
                  data-key={item.key}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex items-center justify-between rounded-lg px-3 py-2.5 font-mono text-[13px] tracking-wide transition-colors",
                    isActive ? "text-ink" : "text-ink-dim hover:text-ink",
                  )}
                >
                  <span>{item.label}</span>
                  <span
                    aria-hidden
                    className="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:opacity-100"
                  >
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
