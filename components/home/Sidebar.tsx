"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { profile } from "@/lib/profile.config";
import { componentAttrs, UI_EVENTS } from "@/lib/build-mode";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme/ThemeToggle";
import TableOfContents from "./TableOfContents";

type SidebarProps = {
  children?: ReactNode;
};

export default function Sidebar({ children }: SidebarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Mobile tab */}
      <button
        type="button"
        aria-label="Open navigation"
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
        <span className="font-mono text-base text-ink" aria-hidden>
          ›
        </span>
      </button>

      {/* Backdrop */}
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
        data-open={open ? "" : undefined}
        {...componentAttrs(
          "Sidebar",
          "Persistent home shell — nav, contact, theme controls, and ⌘K entry.",
        )}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(85vw,300px)] flex-col overflow-y-auto border-r border-border-color bg-bg px-6 py-8 transition-transform duration-300 ease-[var(--ease-out-soft)] motion-reduce:transition-none lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-[300px] lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full text-xl text-ink-dim hover:bg-surface hover:text-ink lg:hidden"
        >
          ×
        </button>

        <div className="mb-8">
          <Link
            href="/home"
            className="font-serif text-3xl font-light tracking-tight text-ink"
            onClick={() => setOpen(false)}
          >
            {profile.handle}
          </Link>
          <p className="mt-1 font-mono text-xs tracking-wide text-ink-dim uppercase">
            {profile.tagline}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-dim">{profile.bio}</p>
        </div>

        <TableOfContents />

        <div className="mt-auto pt-10">
          <p className="mb-3 font-mono text-[11px] tracking-[0.18em] text-ink-dim uppercase">
            Contact
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <a
                href={`mailto:${profile.contact.email}`}
                className="text-ink-dim underline-offset-2 hover:text-ink hover:underline"
              >
                {profile.contact.email}
              </a>
            </li>
            <li>
              <span className="text-ink-faint">
                GitHub <span className="font-mono text-[10px]">(TODO)</span>
              </span>
            </li>
            <li>
              <span className="text-ink-faint">
                LinkedIn <span className="font-mono text-[10px]">(TODO)</span>
              </span>
            </li>
            <li>
              <a
                href={profile.contact.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-dim underline-offset-2 hover:text-ink hover:underline"
              >
                Résumé
              </a>
            </li>
          </ul>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent(UI_EVENTS.commandPaletteOpen),
                )
              }
              className="flex w-full items-center justify-between rounded-lg border border-border-color bg-surface px-3 py-2 font-mono text-[11px] tracking-wide text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
              {...componentAttrs(
                "CommandPaletteTrigger",
                "Fuzzy command menu — navigate, theme, build mode, links.",
              )}
            >
              <span>Command palette</span>
              <span className="text-ink-faint">⌘K</span>
            </button>
            <ThemeToggle />
          </div>
        </div>

        {children}
      </aside>
    </>
  );
}
