"use client";

import type { Ref } from "react";

const SIGNATURE_PATH =
  "M71.007 47.277c5.5-5.5 9.5-12 9.5-18 0-23-25-24.091-34-23-9 1.09-24.972 8.989-26.5 29.5-3.5 47 62.5 34 56 69s-41 32.5-42.5 32.5-28-5-27.5-25c.4-16 21.667-23.167 27.5-21 12.334 10.833 16.781 38.541 45 26 27-12 35.5-29 45-44 5.27-8.32 1.5-23.5-15-7s-18.5 66 5.5 68.5 33.5-35.5 33.5-43.5 4.5-30-16-32.5-17.5 21-10.5 27.5c13.282 12.333 49.437 0 49.5-15.5.093-22.589 0 64 0 64-1.5 6.5 22.349-68.5 36.5-68.5 18.5 0 12.357 48.929 5 71-2 6 22-75.5 37.5-71s5.119 42.906 0 68.5c-1.5 7.5 37.897-39.615 41-64 3.5-27.5-15.224 65.919 2.5 66.5 30.5 1 44.533-69.5 44-66.5-3.637 20.5 0 49.858 0 64 0 21.5 25.5-18.5 31.5-32";

export default function SignatureSvg({
  pathRef,
}: {
  pathRef: Ref<SVGPathElement>;
}) {
  return (
    <svg
      width="374"
      height="147"
      viewBox="0 0 374 147"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-[min(60vw,374px)]"
    >
      <path
        ref={pathRef}
        d={SIGNATURE_PATH}
        // Hidden until GSAP applies the dash setup, so the fully-drawn
        // signature never flashes on first paint before hydration.
        style={{ opacity: 0 }}
        fill="none"
        stroke="#ece8e1"
        strokeWidth={12}
        strokeMiterlimit={4.134}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
