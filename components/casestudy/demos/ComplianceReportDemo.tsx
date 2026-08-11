"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

type ReportView = "Framework" | "Cloud" | "Owner";

type Projection = {
  eyebrow: string;
  summary: string;
  groups: Array<{
    label: string;
    score: number;
    violations: number;
  }>;
};

const projections: Record<ReportView, Projection> = {
  Framework: {
    eyebrow: "DEFAULT",
    summary: "The audit grouped by the policies a reviewer needs to sign off.",
    groups: [
      { label: "Access controls", score: 91, violations: 3 },
      { label: "Data protection", score: 84, violations: 7 },
      { label: "Audit readiness", score: 72, violations: 11 },
    ],
  },
  Cloud: {
    eyebrow: "CLOUD_WISE",
    summary: "The same findings regrouped around infrastructure ownership.",
    groups: [
      { label: "AWS", score: 87, violations: 6 },
      { label: "GCP", score: 79, violations: 9 },
      { label: "Azure", score: 76, violations: 6 },
    ],
  },
  Owner: {
    eyebrow: "OWNER_WISE",
    summary: "The same findings regrouped around the people who can resolve them.",
    groups: [
      { label: "Platform", score: 88, violations: 5 },
      { label: "Data", score: 81, violations: 8 },
      { label: "Identity", score: 73, violations: 8 },
    ],
  },
};

export default function ComplianceReportDemo() {
  const [view, setView] = useState<ReportView>("Framework");
  const projection = projections[view];

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl border border-thumb-border bg-white text-slate-950 shadow-2xl shadow-black/25">
      <header className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[9px] tracking-[0.16em] text-slate-500 uppercase">
            Synthetic compliance report
          </p>
          <p className="mt-1 text-sm font-semibold">One dataset, three projections</p>
        </div>
        <div className="flex rounded-lg bg-slate-100 p-1" aria-label="Report view">
          {(Object.keys(projections) as ReportView[]).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={view === item}
              onClick={() => setView(item)}
              className={cn(
                "rounded-md px-2.5 py-1.5 font-mono text-[10px] transition-colors",
                view === item
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-900",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-4 p-4 sm:grid-cols-[112px_1fr]">
        <div className="flex flex-col justify-between rounded-lg bg-slate-950 p-3 text-white">
          <div>
            <p className="font-mono text-[9px] tracking-widest text-slate-400 uppercase">
              Overall
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">82%</p>
          </div>
          <p className="mt-5 font-mono text-[9px] text-slate-400">
            21 open findings
          </p>
        </div>

        <div className="min-w-0">
          <div className="mb-3">
            <p className="font-mono text-[9px] tracking-widest text-blue-700 uppercase">
              TemplateType · {projection.eyebrow}
            </p>
            <p className="mt-1 text-xs leading-4 text-slate-600">
              {projection.summary}
            </p>
          </div>
          <ul className="grid gap-2">
            {projection.groups.map((group) => (
              <li
                key={group.label}
                className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-slate-200 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-3 text-xs">
                    <span className="truncate font-medium">{group.label}</span>
                    <span className="font-mono text-[9px] text-slate-500">
                      {group.violations} open
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${group.score}%` }}
                    />
                  </div>
                </div>
                <span className="font-mono text-[10px] font-medium tabular-nums">
                  {group.score}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
