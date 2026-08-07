"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { componentAttrs } from "@/lib/build-mode";
import { homeNavItems, type HomeNavKey } from "@/lib/home.config";
import { usePageTransition } from "@/lib/page-transition-context";
import { cn } from "@/lib/utils";

function resolveActiveKey(pathname: string): HomeNavKey {
  if (pathname.startsWith("/home/work")) return "work";
  if (pathname.startsWith("/home/experience")) return "experience";
  if (pathname.startsWith("/home/about")) return "about";
  if (pathname.startsWith("/home/photography")) return "photography";
  if (pathname.startsWith("/home/playground")) return "playground";
  return "work";
}

type TableOfContentsProps = {
  onNavigate?: () => void;
};

export default function TableOfContents({
  onNavigate,
}: TableOfContentsProps) {
  const pathname = usePathname();
  const active = resolveActiveKey(pathname);
  const cover = usePageTransition();

  const onNavClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      onNavigate?.();
      if (href === pathname) return;
      cover({ href, slide: true });
    },
    [cover, onNavigate, pathname],
  );

  return (
    <nav
      aria-label="Site sections"
      data-toc
      {...componentAttrs(
        "TableOfContents",
        "Router-owned, numbered navigation for the home sections.",
      )}
    >
      <ul data-toc-list className="flex flex-col gap-1.75">
        {homeNavItems.map((item) => {
          const isActive = item.key === active;
          const [number, label] = item.label.split(". ");

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                onClick={(event) => onNavClick(event, item.href)}
                data-toc-item
                data-key={item.key}
                data-pixel-nav={item.key}
                aria-current={isActive ? "page" : undefined}
                className="group flex items-baseline gap-2.5"
              >
                <span
                  className={cn(
                    "font-mono w-4 shrink-0 text-metadata leading-none font-medium tabular-nums transition-colors duration-150",
                    isActive
                      ? "text-accent"
                      : "text-ink-faint group-hover:text-accent",
                  )}
                >
                  {number}
                </span>
                <span
                  className={cn(
                    "font-body text-[20px] leading-[1.15] font-semibold tracking-[-0.035em] transition-colors duration-150 lg:text-[27px]",
                    isActive
                      ? "text-ink"
                      : "text-ink-faint group-hover:text-ink",
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
