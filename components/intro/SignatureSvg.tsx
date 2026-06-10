"use client";

import type { Ref } from "react";

// Both paths come from their source SVG files (assets/svg/) via the Server
// Component layout, extracted at build time. This component is client-only
// because it needs a live ref for GSAP's getTotalLength() + dashoffset animation.

export default function SignatureSvg({
  pathRef,
  strokePath,
  fillContent,
}: {
  pathRef: Ref<SVGPathElement>;
  strokePath: string;
  fillContent: string;
}) {
  return (
    <svg
      width="673"
      height="199"
      viewBox="0 0 673 199"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-[min(70vw,540px)]"
    >
      <defs>
        <mask
          id="sig-reveal"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="673"
          height="199"
        >
          {/*
           * s1 mask path: white stroke gates visibility of s2 beneath it.
           * opacity:0 keeps the mask closed before GSAP sets the dasharray,
           * preventing a flash of the fully-revealed brush on first paint.
           * stroke-width bumped 14→20 so the brush edges of s2 aren't clipped.
           */}
          <path
            ref={pathRef}
            d={strokePath}
            style={{ opacity: 0 }}
            fill="none"
            stroke="#fff"
            strokeWidth={20}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>

      {/*
       * s2 content: the visible brush artwork, revealed as the mask opens.
       * Injected as raw inner SVG so the file can contain gradients, textures,
       * or multiple paths without any changes here.
       * Solid fills are stripped at build time; paths inherit this <g>'s fill.
       * Gradient/pattern fill="url(...)" references pass through untouched.
       */}
      <g
        mask="url(#sig-reveal)"
        transform="translate(7 7) scale(0.9979 0.9902)"
        dangerouslySetInnerHTML={{ __html: fillContent }}
      />
    </svg>
  );
}
