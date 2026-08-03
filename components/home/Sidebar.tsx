"use client";

import { useMediaQuery } from "@/components/landing/use-media-query";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { componentAttrs, UI_EVENTS } from "@/lib/build-mode";
import { usePageTransition } from "@/lib/page-transition-context";
import { profile } from "@/lib/profile.config";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import PixelPet from "./PixelPet";
import { useLocalTime } from "./sidebar-time";
import TableOfContents from "./TableOfContents";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const localTime = useLocalTime(profile.timeZone);
  const cover = usePageTransition();

  const onWordmarkClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      setOpen(false);
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      event.preventDefault();
      cover({
        href: "/",
        originEl: event.currentTarget,
        direction: "backward",
      });
    },
    [cover],
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <aside
        data-home-sidebar
        data-lenis-prevent
        {...componentAttrs(
          "Sidebar",
          "Sticky home rail with router navigation, live status, Pixel, contact, and utilities.",
        )}
        className="sticky top-0 z-50 flex w-full shrink-0 flex-col border-b border-border-color bg-sidebar-bg/95 px-5 py-3 backdrop-blur-lg lg:h-screen lg:w-75 lg:overflow-y-auto lg:border-r lg:border-b-0 lg:bg-sidebar-bg lg:px-6.5 lg:pt-9.5 lg:pb-5.5 lg:backdrop-blur-none"
      >
        <div className="flex items-baseline justify-between gap-4 lg:hidden">
          <Wordmark onClick={onWordmarkClick} />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="home-mobile-menu"
            onClick={() => setOpen((current) => !current)}
            className="flex items-center gap-2 [font-family:var(--font-home-jetbrains)] text-[10px] leading-none font-semibold tracking-[0.14em] text-ink-dim uppercase transition-colors hover:text-ink"
          >
            <span>MENU</span>
            <span aria-hidden>{open ? "▴" : "▾"}</span>
          </button>
        </div>

        {open && (
          <div
            id="home-mobile-menu"
            data-mobile-menu
            className="flex flex-col gap-6 pt-6 lg:hidden"
          >
            <TableOfContents onNavigate={() => setOpen(false)} />
            <StatusRow localTime={localTime} />
            <UtilityRow />
          </div>
        )}

        <div className="hidden min-h-0 flex-1 flex-col gap-6 lg:flex">
          <Wordmark onClick={onWordmarkClick} />
          <TableOfContents />
          <StatusRow localTime={localTime} />

          <div data-sidebar-spacer aria-hidden className="flex-1" />

          {isDesktop && <PixelPet />}
          <ContactGroup />
          <UtilityRow />
        </div>
      </aside>
    </>
  );
}

function Wordmark({
  onClick,
}: {
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <div className="flex items-baseline gap-2.25">
      <Link
        href="/"
        onClick={onClick}
        className="[font-family:var(--font-home-instrument)] text-[20px] leading-none text-ink transition-colors hover:text-accent"
      >
        {profile.handle}
      </Link>
      <p className="[font-family:var(--font-home-jetbrains)] text-[9.5px] leading-none font-medium tracking-[0.14em] text-ink-faint uppercase">
        {profile.role}
      </p>
    </div>
  );
}

function StatusRow({ localTime }: { localTime: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="size-1.5 shrink-0 animate-pulse rounded-full bg-accent animation-duration-[3.4s] [box-shadow:0_0_0_3px_color-mix(in_srgb,var(--accent)_16%,transparent)]"
      />
      <p className="[font-family:var(--font-home-poppins)] text-[12.5px] leading-none font-medium text-ink-dim">
        {profile.availability}
      </p>
      <time className="ml-auto [font-family:var(--font-home-jetbrains)] text-[10.5px] leading-none font-medium text-ink-faint tabular-nums">
        {localTime}
      </time>
    </div>
  );
}

function ContactGroup() {
  return (
    <div className="flex flex-col gap-3 border-t border-border-color pt-4">
      <a
        href={`mailto:${profile.contact.email}`}
        className="w-fit [font-family:var(--font-home-poppins)] text-[13.5px] leading-none font-medium text-ink transition-colors hover:text-accent"
      >
        Email me
      </a>
      <div className="flex flex-wrap gap-4 [font-family:var(--font-home-poppins)] text-[12.5px] leading-none font-medium text-ink-dim">
        <SocialLink href={profile.contact.github}>GitHub</SocialLink>
        <SocialLink href={profile.contact.linkedin}>LinkedIn</SocialLink>
        <SocialLink href={profile.contact.resumeUrl}>Resume</SocialLink>
      </div>
    </div>
  );
}

function SocialLink({ children, href }: { children: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="transition-colors hover:text-ink"
    >
      {children}
    </a>
  );
}

function UtilityRow() {
  return (
    <div className="flex items-center gap-3.5 border-t border-border-color pt-3.75">
      <ThemeToggle variant="sidebar" />
      <button
        type="button"
        onClick={() =>
          window.dispatchEvent(new CustomEvent(UI_EVENTS.commandPaletteOpen))
        }
        className="ml-auto flex items-center gap-2 [font-family:var(--font-home-jetbrains)] text-[10px] leading-none font-medium tracking-[0.12em] text-ink-faint uppercase transition-colors hover:text-ink"
        {...componentAttrs(
          "CommandPaletteTrigger",
          "Open the existing fuzzy command menu.",
        )}
      >
        <span>Search</span>
        <span className="rounded-lg border border-border-color px-1.25 py-0.75 tracking-normal text-ink-dim">
          ⌘K
        </span>
      </button>
    </div>
  );
}
