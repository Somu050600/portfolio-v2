"use client";

import { componentAttrs } from "@/lib/build-mode";
import { metricsProvenance, roles, type Role } from "@/lib/experience.config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

const mono = "font-mono";
const display = "font-display";
const sans = "font-body";
const chip = cn(
  mono,
  "rounded-full bg-elevated px-2.75 py-1.75 text-metadata leading-none font-medium tracking-[0.09em] whitespace-nowrap text-ink/90",
);

export function getNextOpenRole(
  current: string | null,
  requested: string,
): string | null {
  return current === requested ? null : requested;
}

export function shouldOpenRoleOnPointer(
  pointerType: string,
  viewportWidth: number,
  canHover: boolean,
): boolean {
  return pointerType !== "touch" && viewportWidth >= 900 && canHover;
}

function ExperienceRole({
  role,
  index,
  open,
  onOpen,
  onClose,
  onToggle,
}: {
  role: Role;
  index: number;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}) {
  const detailsId = `experience-role-${index + 1}-details`;
  const triggerId = `experience-role-${index + 1}-trigger`;

  return (
    <article
      data-open={open ? "" : undefined}
      onPointerEnter={(event) => {
        if (
          shouldOpenRoleOnPointer(
            event.pointerType,
            window.innerWidth,
            window.matchMedia("(hover: hover)").matches,
          )
        ) {
          onOpen();
        }
      }}
      onPointerLeave={(event) => {
        if (
          shouldOpenRoleOnPointer(
            event.pointerType,
            window.innerWidth,
            window.matchMedia("(hover: hover)").matches,
          )
        ) {
          onClose();
        }
      }}
      {...componentAttrs(
        `ExperienceTimeline.${role.company}`,
        `${role.role} at ${role.company}, ${role.dateLabel}.`,
      )}
      className={cn(
        "relative grid grid-cols-[120px_minmax(0,1fr)] gap-x-9.5 border-t border-dotted border-border-color py-6 pb-6.5",
        "max-[899px]:grid-cols-1 max-[899px]:gap-y-3 max-[899px]:py-5.5 max-[899px]:pb-6 max-[899px]:pl-5.5",
        index === 0 && "border-t-0 pt-1.5 max-[899px]:pt-1",
      )}
    >
      <div className="flex flex-col items-end gap-1.5 pt-1.25 text-right max-[899px]:flex-row max-[899px]:items-baseline max-[899px]:gap-2.5 max-[899px]:pt-0 max-[899px]:text-left">
        <span
          className={cn(
            mono,
            "text-xs leading-[1.4] font-medium text-ink/80",
          )}
        >
          {role.dateLabel}
        </span>
        <span
          className={cn(
            mono,
            "text-metadata leading-none font-normal tracking-[0.14em] text-ink-faint uppercase",
          )}
        >
          {role.location}
        </span>
      </div>

      <span
        data-open={open ? "" : undefined}
        className={cn(
          "absolute left-33.75 size-2.25 rounded-full border border-ink/30 bg-bg transition-[background-color,border-color,box-shadow] duration-240 ease-[cubic-bezier(.22,.7,.25,1)]",
          "data-open:border-accent data-open:bg-accent data-open:shadow-[0_0_0_4px_var(--accent-soft)] motion-reduce:transition-none",
          "max-[899px]:left-0",
          index === 0
            ? "top-3.5 max-[899px]:top-2"
            : "top-8 max-[899px]:top-7",
        )}
        aria-hidden
      />

      <div className="flex min-w-0 flex-col gap-2.25">
        <button
          id={triggerId}
          type="button"
          aria-controls={detailsId}
          aria-expanded={open}
          aria-label={`${open ? "Hide" : "View"} ${role.company} experience details`}
          onClick={onToggle}
          className="flex w-full items-baseline gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <span
            data-open={open ? "" : undefined}
            className={cn(
              display,
              "text-card-title font-medium text-ink/90 transition-colors duration-240 ease-[cubic-bezier(.22,.7,.25,1)] data-open:text-ink motion-reduce:transition-none",
            )}
          >
            {role.company}
          </span>
          {role.current && (
            <span className={cn(chip, "ml-auto max-[899px]:ml-0")}>
              CURRENT
            </span>
          )}
          <span
            className={cn(
              mono,
              "ml-auto hidden rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1.5 text-metadata leading-none font-semibold tracking-[0.12em] text-accent uppercase max-[899px]:inline-flex",
            )}
          >
            {open ? "VIEW LESS −" : "VIEW MORE +"}
          </span>
        </button>

        <p
          className={cn(
            sans,
            "text-[13px] leading-[1.4] font-medium text-ink-dim",
          )}
        >
          {role.role} · {role.domain}
        </p>
        <p
          className={cn(
            sans,
            "max-w-[58ch] text-body-sm font-normal text-ink-dim",
          )}
        >
          {role.summary}
        </p>

        <ul
          className="flex flex-wrap gap-x-5.5 gap-y-2 pt-0.5"
          aria-label={`${role.company} metrics`}
        >
          {role.metrics.map((metric) => (
            <li
              key={metric}
              className={cn(
                mono,
                "text-[13px] leading-[1.3] font-normal text-accent",
              )}
            >
              {metric}
            </li>
          ))}
        </ul>

        <div
          id={detailsId}
          role="region"
          aria-labelledby={triggerId}
          aria-hidden={!open}
          data-open={open ? "" : undefined}
          className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity,margin-top] duration-[380ms,220ms,380ms] ease-[cubic-bezier(.22,.7,.25,1)] data-open:mt-4 data-open:grid-rows-[1fr] data-open:opacity-100 motion-reduce:transition-none max-[899px]:data-open:mt-3.5"
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex flex-col gap-2 border-t border-dotted border-border-color pt-3.5">
              <ul className="flex flex-col gap-2">
                {role.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className={cn(
                      sans,
                      "flex gap-2.5 text-body-sm font-normal text-ink-dim",
                    )}
                  >
                    <span className="shrink-0 text-accent" aria-hidden>
                      ·
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <ul
                className="mt-1.5 flex flex-wrap gap-2"
                aria-label={`${role.company} technology stack`}
              >
                {role.stack.map((technology) => (
                  <li key={technology} className={chip}>
                    {technology}
                  </li>
                ))}
              </ul>

              {/* The two pages used to not know about each other. */}
              {role.caseStudies && role.caseStudies.length > 0 && (
                <ul
                  className="mt-2 flex flex-col gap-1.5"
                  aria-label={`${role.company} case studies`}
                >
                  {role.caseStudies.map((study) => (
                    <li key={study.slug}>
                      <Link
                        href={`/home/work/${study.slug}`}
                        className={cn(
                          sans,
                          "text-body-sm font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
                        )}
                      >
                        {`Read the case study: ${study.label} ↗`}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ExperienceTimeline() {
  const [openRole, setOpenRole] = useState<string | null>(null);

  return (
    <section
      aria-labelledby="experience-heading"
      className="flex flex-col gap-7.5"
      {...componentAttrs(
        "ExperienceTimeline",
        "Spine timeline: accessible single-open role disclosures with visible metrics.",
      )}
    >
      <header className="flex flex-col gap-3.75">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              mono,
              "shrink-0 text-metadata leading-none font-semibold tracking-[0.16em] text-accent uppercase",
            )}
          >
            02 · EXPERIENCE
          </span>
          <span className="h-px flex-1 bg-border-color" aria-hidden />
          <span
            className={cn(
              mono,
              "shrink-0 text-metadata leading-none font-normal tracking-[0.14em] text-ink-faint uppercase",
            )}
          >
            03 ROLES · 2023 TO NOW
          </span>
        </div>
        <h1
          id="experience-heading"
          className={cn(
            display,
            "text-balance text-page-title font-semibold tracking-tight text-ink-faint",
          )}
        >
          Security, compliance, commerce.{" "}
          <span className="text-ink">Three roles, measurable outcomes.</span>
        </h1>
        <p
          className={cn(
            sans,
            "max-w-[62ch] text-body-sm font-normal text-ink-dim",
          )}
        >
          Every role here has a number attached to it, and that&apos;s deliberate.
          Hover a role to see what it actually involved.
        </p>
        <p
          className={cn(
            mono,
            "max-w-[62ch] text-[11.5px] leading-[1.6] font-normal text-ink-faint",
          )}
        >
          {metricsProvenance}
        </p>
      </header>

      <div data-expansion-reserve className="pb-42.5 max-[899px]:pb-0">
        <div className="relative" aria-label="Experience roles">
          <span
            className="absolute top-2.5 bottom-1.5 left-34.75 w-px [background:repeating-linear-gradient(to_bottom,color-mix(in_srgb,var(--ink)_18%,transparent)_0_3px,transparent_3px_8px)] max-[899px]:left-1"
            aria-hidden
          />
          {roles.map((role, index) => {
            const open = role.company === openRole;
            return (
              <ExperienceRole
                key={role.company}
                role={role}
                index={index}
                open={open}
                onOpen={() => setOpenRole(role.company)}
                onClose={() =>
                  setOpenRole((current) =>
                    current === role.company ? null : current,
                  )
                }
                onToggle={() =>
                  setOpenRole((current) =>
                    getNextOpenRole(current, role.company),
                  )
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
