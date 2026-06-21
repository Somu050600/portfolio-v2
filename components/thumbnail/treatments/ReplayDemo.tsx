"use client";

import SlidingBarDemo from "@/components/casestudy/demos/SlidingBarDemo";
import type { TreatmentProps } from "../registry";

/**
 * Live-preview thumbnail for the "This Site" case study. Renders the sliding
 * active-bar nav at rest; on hover (`active`) a synthetic cursor moves between
 * items and clicks, driving the bar slide on a loop.
 */
export default function ReplayDemo({ active }: TreatmentProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-[240px]">
        <SlidingBarDemo autoplay active={active} />
      </div>
    </div>
  );
}
