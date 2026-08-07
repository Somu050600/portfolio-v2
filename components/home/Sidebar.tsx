"use client";

import { useMediaQuery } from "@/components/landing/use-media-query";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { componentAttrs, UI_EVENTS } from "@/lib/build-mode";
import { usePageTransition } from "@/lib/page-transition-context";
import { profile } from "@/lib/profile.config";
import { typeStyles } from "@/lib/typography";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import PixelPet from "./PixelPet";
import { useLocalTime } from "./sidebar-time";
import TableOfContents from "./TableOfContents";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const localTime = useLocalTime(profile.timeZone);
  const cover = usePageTransition();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  // Drawer stays mounted through its close tween, then unmounts.
  const [drawerMounted, setDrawerMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerTlRef = useRef<gsap.core.Timeline | null>(null);
  const drawerClosedRef = useRef<(() => void) | null>(null);

  /** Releases whoever is waiting on the drawer's close tween. */
  const resolveDrawerClosed = useCallback(() => {
    drawerClosedRef.current?.();
    drawerClosedRef.current = null;
  }, []);

  /** Resolves once the drawer has finished closing — or immediately if shut. */
  const closeMenu = useCallback(() => {
    if (!open) return Promise.resolve();
    setOpen(false);
    return new Promise<void>((resolve) => {
      drawerClosedRef.current = resolve;
    });
  }, [open]);

  const onWordmarkClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        void closeMenu();
        return;
      }

      event.preventDefault();
      // Read the anchor now — currentTarget is gone once we await.
      const originEl = event.currentTarget;
      void closeMenu().then(() =>
        cover({ href: "/", originEl, direction: "backward" }),
      );
    },
    [closeMenu, cover],
  );

  const onRoleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        void closeMenu();
        return;
      }

      event.preventDefault();
      if (pathname === "/home") {
        void closeMenu();
        return;
      }
      void closeMenu().then(() => cover({ href: "/home", slide: true }));
    },
    [closeMenu, cover, pathname],
  );

  const toggleMenu = useCallback(() => {
    setDrawerMounted(true);
    setOpen((current) => !current);
  }, []);

  useLayoutEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    drawerTlRef.current?.kill();
    // Reduced motion keeps the same mount/unmount bookkeeping, zero duration.
    const seconds = (value: number) => (reducedMotion ? 0 : value);

    // Re-opening aborts a close, so nobody is left waiting on it.
    if (open) resolveDrawerClosed();

    drawerTlRef.current = open
      ? gsap
          .timeline()
          // `to` (not `fromTo`) so a re-open mid-close resumes from the
          // current height instead of snapping back to 0.
          .to(drawer, {
            height: "auto",
            opacity: 1,
            duration: seconds(0.42),
            ease: "power3.out",
            onComplete: () => gsap.set(drawer, { clearProps: "height" }),
          })
          .fromTo(
            drawer.children,
            { y: -10, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: seconds(0.32),
              stagger: seconds(0.06),
              ease: "power2.out",
              clearProps: "transform,opacity",
            },
            `<${seconds(0.08)}`,
          )
      : gsap
          .timeline({
            onComplete: () => {
              setDrawerMounted(false);
              resolveDrawerClosed();
            },
          })
          .to(drawer, {
            height: 0,
            opacity: 0,
            duration: seconds(0.26),
            ease: "power2.in",
          });

    return () => {
      drawerTlRef.current?.kill();
    };
  }, [open, drawerMounted, reducedMotion, resolveDrawerClosed]);

  // A sidebar that unmounts mid-close must not strand a pending navigation.
  useEffect(() => resolveDrawerClosed, [resolveDrawerClosed]);

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
          <Wordmark onClick={onWordmarkClick} onRoleClick={onRoleClick} />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="home-mobile-menu"
            onClick={toggleMenu}
            className="flex items-center gap-2 font-body text-sm leading-none font-semibold tracking-[0.08em] text-ink-dim uppercase transition-colors hover:text-ink"
          >
            <span>MENU</span>
            <span
              aria-hidden
              className={cn(
                "transition-transform duration-300 ease-out",
                open && "-rotate-180",
              )}
            >
              ▾
            </span>
          </button>
        </div>

        {drawerMounted && (
          <div
            ref={drawerRef}
            id="home-mobile-menu"
            data-mobile-menu
            style={{ height: 0, opacity: 0 }}
            className="flex flex-col overflow-hidden lg:hidden"
          >
            <div className="pt-6">
              <TableOfContents onNavigate={closeMenu} />
            </div>
            <div className="pt-6">
              <StatusRow localTime={localTime} />
            </div>
            <div className="pt-6">
              <UtilityRow />
            </div>
          </div>
        )}

        <div className="hidden min-h-0 flex-1 flex-col gap-6 lg:flex">
          <Wordmark onClick={onWordmarkClick} onRoleClick={onRoleClick} />
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
  onRoleClick,
}: {
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  onRoleClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <div className="flex items-baseline gap-2.25">
      <Link
        href="/"
        onClick={onClick}
        className="font-display text-[20px] leading-none font-semibold text-ink transition-colors hover:text-accent"
      >
        {profile.handle}
      </Link>
      <Link
        href="/home"
        onClick={onRoleClick}
        className="font-mono text-metadata leading-none font-medium tracking-[0.14em] text-ink-faint uppercase transition-colors hover:text-ink"
      >
        {profile.role}
      </Link>
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
      <p className={`${typeStyles.metadata} leading-none text-ink-dim`}>
        {profile.availability}
      </p>
      <time className="ml-auto font-mono text-metadata leading-none font-medium text-ink-faint tabular-nums">
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
        className="w-fit font-body text-sm leading-none font-medium text-ink transition-colors hover:text-accent"
      >
        Email me
      </a>
      <div className="flex flex-wrap gap-4 font-body text-sm leading-none font-medium text-ink-dim">
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
        className="ml-auto flex items-center gap-2 font-body text-sm leading-none font-medium tracking-[0.08em] text-ink-faint uppercase transition-colors hover:text-ink"
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
