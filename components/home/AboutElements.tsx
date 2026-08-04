"use client";

import { aboutPathStops, careAbout } from "@/lib/about.config";
import { componentAttrs } from "@/lib/build-mode";
import { profile } from "@/lib/profile.config";
import { cn } from "@/lib/utils";
import { useState } from "react";
import SkillsGrid, { shouldRevealAtomicNumbers } from "./SkillsGrid";
import ThemeTintedPortrait from "./ThemeTintedPortrait";

const mono = "[font-family:var(--font-home-jetbrains)]";
const display = "[font-family:var(--font-home-instrument)]";
const sans = "[font-family:var(--font-home-poppins)]";

export default function AboutElements() {
  const [chemistryPinned, setChemistryPinned] = useState(false);
  const [chemistryHovered, setChemistryHovered] = useState(false);
  const showAtomicNumbers = shouldRevealAtomicNumbers(
    chemistryPinned,
    chemistryHovered,
  );

  return (
    <main
      className="mx-auto flex w-full max-w-235 flex-col gap-6.5 px-5 pt-5.5 pb-7 min-[901px]:gap-8.5 min-[901px]:px-11 min-[901px]:pt-10.5 min-[901px]:pb-12"
      {...componentAttrs(
        "AboutElements",
        "Elements about page with a filterable skills table and chemistry reveal.",
      )}
    >
      <header className="flex flex-col gap-3.75">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              mono,
              "shrink-0 text-[10px] leading-none font-semibold tracking-[0.16em] text-accent uppercase",
            )}
          >
            03 — ABOUT
          </span>
          <span className="h-px flex-1 bg-border-color" aria-hidden />
          <span
            className={cn(
              mono,
              "shrink-0 text-[10px] leading-none font-normal tracking-[0.14em] text-ink-faint uppercase",
            )}
          >
            24 ELEMENTS
          </span>
        </div>
        <h1
          className={cn(
            display,
            "text-[38px] leading-[1.05] font-normal tracking-[-0.015em] text-ink min-[901px]:text-[46px]",
          )}
        >
          {profile.name}
        </h1>
        <p
          className={cn(
            sans,
            "max-w-[62ch] text-pretty text-sm leading-[1.65] font-normal text-ink-dim min-[901px]:text-[15px]",
          )}
        >
          Also known as {profile.handle}, I&apos;m a frontend engineer working
          across React, Next.js, TypeScript, design systems, and web
          performance.
        </p>
      </header>

      <div className="flex flex-col gap-6.5 min-[901px]:gap-4.5 min-[1201px]:grid min-[1201px]:grid-cols-[minmax(0,1fr)_292px] min-[1201px]:items-start min-[1201px]:gap-10.5">
        <div className="order-2 flex min-w-0 flex-col gap-6.5 min-[901px]:order-1 min-[901px]:gap-8.5">
          <section
            aria-label="The long way to frontend"
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <p
                className={cn(
                  sans,
                  "text-pretty text-sm leading-[1.72] font-normal text-ink-dim min-[901px]:max-w-[52ch] min-[901px]:text-[15px]",
                )}
              >
                Came to frontend the long way —{" "}
                <button
                  type="button"
                  aria-pressed={chemistryPinned}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== "touch") {
                      setChemistryHovered(true);
                    }
                  }}
                  onPointerLeave={() => setChemistryHovered(false)}
                  onClick={() => setChemistryPinned((current) => !current)}
                  className={cn(
                    "cursor-pointer border-b border-dotted border-accent/50 text-ink outline-none transition-[color,border-color] duration-240 focus-visible:border-accent focus-visible:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none",
                    chemistryPinned && "border-accent text-accent",
                  )}
                >
                  M.Sc. Chemistry
                </button>{" "}
                + B.E. Civil at BITS Pilani, then fell for the craft of
                interfaces.
              </p>
              <p
                className={cn(
                  mono,
                  "text-[9px] leading-none font-normal tracking-[0.12em] text-ink-faint uppercase min-[901px]:hidden",
                )}
              >
                TAP THE HIGHLIGHTED PHRASE
              </p>
            </div>

            <PathStops />
          </section>

          <SkillsGrid showAtomicNumbers={showAtomicNumbers} />
          <Principles />
        </div>

        <div className="contents min-[901px]:order-2 min-[901px]:flex min-[901px]:items-start min-[901px]:gap-4.5 min-[1201px]:flex-col min-[1201px]:gap-3.5">
          <ThemeTintedPortrait />
          <ContactCard />
        </div>
      </div>
    </main>
  );
}

function PathStops() {
  return (
    <ol className="relative flex flex-col gap-4 pl-5 min-[901px]:grid min-[901px]:grid-cols-3 min-[901px]:gap-0 min-[901px]:pt-1 min-[901px]:pl-0">
      <span
        aria-hidden
        className="absolute top-2 bottom-3.5 left-1 w-px [background:repeating-linear-gradient(to_bottom,color-mix(in_srgb,var(--ink)_19%,transparent)_0_3px,transparent_3px_8px)] min-[901px]:right-[12%] min-[901px]:bottom-auto min-[901px]:h-px min-[901px]:w-auto min-[901px]:[background:repeating-linear-gradient(to_right,color-mix(in_srgb,var(--ink)_19%,transparent)_0_3px,transparent_3px_8px)]"
      />
      {aboutPathStops.map((stop, index) => {
        const present = index === aboutPathStops.length - 1;
        return (
          <li
            key={stop.title}
            className="group relative flex flex-col gap-0.75 min-[901px]:gap-2.5"
          >
            <span
              aria-hidden
              className={cn(
                "absolute top-1.25 -left-5 z-1 size-2.25 rounded-full border border-ink/30 bg-bg transition-[background-color,border-color,box-shadow] duration-300 group-hover:border-accent group-hover:bg-accent group-hover:shadow-[0_0_0_4px_var(--accent-soft)] motion-reduce:transition-none min-[901px]:static",
                present && "border-accent bg-accent",
              )}
            />
            <span className="flex flex-col gap-1">
              <span
                className={cn(
                  display,
                  "text-[17px] leading-[1.2] font-normal text-ink transition-colors duration-240 group-hover:text-ink motion-reduce:transition-none min-[901px]:text-[19px]",
                )}
              >
                {stop.title}
              </span>
              <span
                className={cn(
                  mono,
                  "text-[9.5px] leading-[1.6] font-normal tracking-widest text-ink-faint uppercase",
                )}
              >
                {stop.caption}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Principles() {
  return (
    <section aria-labelledby="about-principles-heading" className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2.5">
        <h2
          id="about-principles-heading"
          className={cn(
            mono,
            "text-[10px] leading-none font-normal tracking-[0.14em] text-ink-faint uppercase",
          )}
        >
          What I care about
        </h2>
        <span className="h-px flex-1 bg-border-color" aria-hidden />
      </div>
      <ol className="grid grid-cols-1 min-[901px]:grid-cols-2 min-[901px]:gap-x-7">
        {careAbout.map((principle, index) => (
          <li
            key={principle}
            className={cn(
              "group grid grid-cols-[24px_minmax(0,1fr)] gap-3 border-t border-dotted border-border-color py-2.75 min-[901px]:grid-cols-[26px_minmax(0,1fr)] min-[901px]:gap-3.5 min-[901px]:py-3",
              index === 0 && "border-t-0 pt-0",
              index === 1 && "min-[901px]:border-t-0 min-[901px]:pt-0",
            )}
          >
            <span
              className={cn(
                mono,
                "text-[11px] leading-[1.6] font-normal text-ink-faint transition-colors duration-240 group-hover:text-accent motion-reduce:transition-none",
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <p
              className={cn(
                sans,
                "text-[12.5px] leading-[1.6] font-normal text-ink-dim",
              )}
            >
              {principle}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ContactCard() {
  return (
    <aside className="order-3 flex min-w-0 flex-1 flex-col gap-2.25 self-stretch rounded-xl border border-border-color bg-surface p-3.5 min-[1201px]:w-full min-[1201px]:flex-none">
      <div className="flex items-center gap-2.25">
        <span
          aria-hidden
          className="size-1.5 shrink-0 animate-pulse rounded-full bg-accent motion-reduce:animate-none [box-shadow:0_0_0_3px_var(--accent-soft)]"
        />
        <span
          className={cn(
            sans,
            "text-xs leading-none font-normal text-ink-dim",
          )}
        >
          Open to work
        </span>
      </div>
      <span
        className={cn(
          mono,
          "break-all text-[9.5px] leading-[1.6] font-normal tracking-widest text-ink-faint",
        )}
      >
        somasekhareega [at] gmail [dot] com
      </span>
      <a
        href={`mailto:${profile.contact.email}`}
        className={cn(
          sans,
          "mt-0.5 rounded-full bg-accent px-4 py-3 text-center text-xs leading-none font-medium text-accent-fg transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none",
        )}
      >
        Email me
      </a>
      <div className="grid grid-cols-2 gap-2">
        <ContactLink href={profile.contact.github}>GitHub</ContactLink>
        <ContactLink href={profile.contact.linkedin}>LinkedIn</ContactLink>
      </div>
      <ContactLink href={profile.contact.resumeUrl}>Download Resume ↓</ContactLink>
    </aside>
  );
}

function ContactLink({ children, href }: { children: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        sans,
        "rounded-full border border-border-color px-3.5 py-2.75 text-center text-[11.5px] leading-none font-medium whitespace-nowrap text-ink-dim transition-[color,border-color] hover:border-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none",
      )}
    >
      {children}
    </a>
  );
}
