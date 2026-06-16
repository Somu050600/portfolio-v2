"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useSettings } from "@/components/settings/SettingsProvider";
import { homeNavItems } from "@/lib/home.config";
import { profile } from "@/lib/profile.config";
import { projects } from "@/lib/projects.config";
import { usePageTransition } from "@/lib/page-transition-context";
import {
  openThemeCustomizer,
  useThemeToggleAction,
} from "@/lib/theme-actions";

const EMAIL = profile.contact.email;
const GITHUB = profile.contact.github;
const LINKEDIN = profile.contact.linkedin;

export default function CommandPalette() {
  const { commandOpen, setCommandOpen, buildMode, toggleBuildMode } =
    useSettings();
  const cover = usePageTransition();
  const pathname = usePathname();
  const toggleTheme = useThemeToggleAction();
  const { resolvedTheme } = useTheme();
  const lastFocusRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setCommandOpen(false);
    requestAnimationFrame(() => {
      lastFocusRef.current?.focus();
    });
  }, [setCommandOpen]);

  const open = useCallback(() => {
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    setCommandOpen(true);
  }, [setCommandOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (commandOpen) close();
        else open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandOpen, close, open]);

  useEffect(() => {
    const onOpen = () => open();
    window.addEventListener("ui:command-palette-open", onOpen);
    return () => window.removeEventListener("ui:command-palette-open", onOpen);
  }, [open]);

  const navigate = (href: string) => {
    close();
    if (href === pathname) return;
    cover({
      href,
      originEl: document.activeElement as HTMLElement | null,
    });
  };

  const runAction = async (fn: () => void | Promise<void>) => {
    close();
    await fn();
  };

  return (
    <CommandDialog
      open={commandOpen}
      onOpenChange={(v) => {
        if (!v) close();
        else open();
      }}
      showCloseButton={false}
    >
      <CommandInput placeholder="Search commands…" aria-label="Search commands" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {homeNavItems.map((item) => (
            <CommandItem
              key={item.key}
              value={`${item.label} ${item.href}`}
              onSelect={() => navigate(item.href)}
            >
              {item.label.replace(/^\d+\.\s*/, "")}
            </CommandItem>
          ))}
          {projects.map((p) => {
            const href = p.external
              ? p.href
              : p.caseStudy
                ? `/home/work/${p.slug}`
                : null;
            if (!href) return null;
            return (
              <CommandItem
                key={p.slug}
                value={`project ${p.title} ${p.slug}`}
                onSelect={() => {
                  close();
                  if (p.external) window.open(href, "_blank", "noopener");
                  else navigate(href);
                }}
              >
                {p.title}
                <CommandShortcut>No. {String(p.number).padStart(2, "0")}</CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            value="toggle theme dark light mode"
            onSelect={() => void runAction(toggleTheme)}
          >
            Toggle theme
            <CommandShortcut>
              {resolvedTheme === "dark" ? "Light" : "Dark"}
            </CommandShortcut>
          </CommandItem>
          <CommandItem
            value="open theme editor customize accents"
            onSelect={() =>
              runAction(() => openThemeCustomizer())
            }
          >
            Open theme editor
          </CommandItem>
          <CommandItem
            value="toggle build mode inspect commentary"
            onSelect={() => runAction(toggleBuildMode)}
          >
            {buildMode ? "Disable" : "Enable"} build mode
            <CommandShortcut>Inspect</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="copy email contact"
            onSelect={() =>
              runAction(async () => {
                await navigator.clipboard.writeText(EMAIL);
              })
            }
          >
            Copy email
          </CommandItem>
          <CommandItem
            value="download resume cv"
            onSelect={() => {
              close();
              window.open(profile.contact.resumeUrl, "_blank", "noopener");
            }}
          >
            Download résumé
          </CommandItem>
        </CommandGroup>

        {(GITHUB || LINKEDIN) && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Links">
              {GITHUB && (
                <CommandItem
                  value="github"
                  onSelect={() => {
                    close();
                    window.open(GITHUB, "_blank", "noopener");
                  }}
                >
                  GitHub
                </CommandItem>
              )}
              {LINKEDIN && (
                <CommandItem
                  value="linkedin"
                  onSelect={() => {
                    close();
                    window.open(LINKEDIN, "_blank", "noopener");
                  }}
                >
                  LinkedIn
                </CommandItem>
              )}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function CommandPaletteTrigger({
  className,
}: {
  className?: string;
}) {
  const { setCommandOpen } = useSettings();

  return (
    <button
      type="button"
      onClick={() => setCommandOpen(true)}
      className={className}
      aria-label="Open command palette"
    >
      <span className="font-mono text-[11px] tracking-wide text-ink-dim">
        ⌘K
      </span>
    </button>
  );
}
