"use client";

import dynamic from "next/dynamic";
import StaticFallback from "./StaticFallback";

const R3FCanvasIsland = dynamic(() => import("./R3FCanvasIsland"), {
  ssr: false,
  loading: () => <StaticFallback />,
});

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function canRun3D() {
  if (typeof window === "undefined") return false;

  // Guards live before the dynamic Canvas import so Three/R3F stay out of this
  // client session when the browser cannot benefit from the 3D version.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  return hasWebGL() && !reduceMotion && fineHover;
}

export default function R3FIsland() {
  if (!canRun3D()) return <StaticFallback />;
  return <R3FCanvasIsland />;
}
