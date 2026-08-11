"use client";

import Clip from "@/components/casestudy/vt-previews/Clip";
import CrossFade from "@/components/casestudy/vt-previews/CrossFade";
import Slide from "@/components/casestudy/vt-previews/Slide";
import { useEffect, useState } from "react";
import type { TreatmentProps } from "../registry";

// Montage of lab variants. Each remounts (key=idx) and auto-plays its entry.
const STEPS = [CrossFade, Clip, Slide];
const STEP_MS = 1200;

/**
 * Live-preview thumbnail for the View Transitions field guide. At rest it shows
 * the first variant; on hover (`active`) it cycles cross-fade → clip → slide on
 * a loop, a montage of the lab.
 */
export default function VTCycle({ active }: TreatmentProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(
      () => setIdx((i) => (i + 1) % STEPS.length),
      STEP_MS,
    );
    return () => window.clearInterval(id);
  }, [active]);

  const Step = STEPS[idx];

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-bg p-4"
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--border-color) 1px, transparent 1px)",
        backgroundSize: "15px 15px",
      }}
    >
      <div className="w-full max-w-[240px] scale-90">
        <Step key={idx} runToken={0} />
      </div>
    </div>
  );
}
